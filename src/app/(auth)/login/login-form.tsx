"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";

/**
 * /login form.
 *
 * Two auth paths:
 *
 *   - Admin (emails ending in @mondayandpartners.com): email + password.
 *     One step, signInWithPassword, redirect on success.
 *
 *   - Everyone else: 6-digit OTP code emailed via Supabase Magic Link
 *     template. UI is a two-step state machine:
 *       1. "email" — collect the email, fire signInWithOtp, switch to "code"
 *       2. "code"  — collect the 6-digit code, verifyOtp, redirect on success
 *
 *     The clickable link in the email still works (handled by /auth/callback)
 *     but the code path is the primary, bulletproof flow. Email security
 *     scanners (Gmail, M365 Defender, gov mail systems) cannot consume a
 *     code the way they can pre-fetch and burn a clickable link.
 */

// Admin domain — emails ending in this trigger password auth.
// Magic link (OTP code) is used for every other email.
const ADMIN_DOMAIN = "@mondayandpartners.com";

// Human-readable copy for the few error tokens we redirect with from the
// auth callback routes. Anything else falls through to the raw token so it's
// still surfaced rather than swallowed.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_failed:
    "That link couldn't be used. It may have expired or already been opened. Request a new code below.",
};

type Step = "email" | "code";

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/projects";

  const incomingErrorToken = searchParams.get("error");
  const incomingError = incomingErrorToken
    ? AUTH_ERROR_MESSAGES[incomingErrorToken] || incomingErrorToken
    : null;

  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<
    { type: "success" | "error"; text: string } | null
  >(incomingError ? { type: "error", text: incomingError } : null);

  const codeInputRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (step === "code") {
      codeInputRef.current?.focus();
    }
  }, [step]);

  const isAdminEmail = email.toLowerCase().endsWith(ADMIN_DOMAIN);

  async function sendCode(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const supabase = createClient();

    if (isAdminEmail) {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setIsLoading(false);
      if (error) {
        setMessage({
          type: "error",
          text: error.message || "Invalid email or password.",
        });
      } else {
        window.location.href = redirectTo;
      }
      return;
    }

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        // The clickable-link path still works via /auth/callback for inboxes
        // that don't aggressively pre-fetch. Most users will paste the code
        // into the next step of this form instead.
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });

    setIsLoading(false);
    if (error) {
      setMessage({
        type: "error",
        text:
          error.message ||
          "Couldn't send your code. Please try again in a moment.",
      });
      return;
    }

    setStep("code");
    setMessage({
      type: "success",
      text: "Check your inbox. Enter the 6-digit code below.",
    });
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    const supabase = createClient();
    const cleaned = code.replace(/\D/g, "").slice(0, 10);

    // Supabase OTP length is configurable (default 6, this project is 8).
    // Accept anything in the plausible range and let GoTrue make the final call.
    if (cleaned.length < 6) {
      setIsLoading(false);
      setMessage({
        type: "error",
        text: "Enter the full code from your email.",
      });
      return;
    }

    // signInWithOtp tags the underlying token as 'magiclink' for returning
    // users and 'signup' for first-time confirmations. We don't know which
    // path Supabase took at request time, so we try both. A failed verify
    // does NOT consume the token (only a successful one does) — so the
    // fallback attempt is safe.
    const typeOrder: Array<"magiclink" | "signup" | "email"> = [
      "magiclink",
      "signup",
      "email",
    ];

    let lastError: Error | null = null;
    let signedIn = false;
    for (const otpType of typeOrder) {
      const { error: verifyError } = await supabase.auth.verifyOtp({
        email,
        token: cleaned,
        type: otpType,
      });
      if (!verifyError) {
        signedIn = true;
        break;
      }
      lastError = verifyError;
    }

    setIsLoading(false);

    if (!signedIn) {
      setMessage({
        type: "error",
        text:
          lastError?.message ||
          "That code didn't work. Double-check the latest email or request a new code.",
      });
      return;
    }

    window.location.href = redirectTo;
  }

  function backToEmail() {
    setStep("email");
    setCode("");
    setMessage(null);
  }

  if (step === "code") {
    return (
      <>
        <form onSubmit={verifyCode} className="space-y-4">
          <div className="space-y-1">
            <p className="text-sm text-foreground-muted">
              We sent a code to <strong>{email}</strong>.
            </p>
          </div>

          <Input
            ref={codeInputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder="••••••••"
            value={code}
            onChange={(e) =>
              setCode(e.target.value.replace(/\D/g, "").slice(0, 10))
            }
            required
            maxLength={10}
            className="text-center tracking-[0.4em] font-mono"
          />

          <Button type="submit" className="w-full" isLoading={isLoading}>
            Sign in
          </Button>

          <button
            type="button"
            onClick={backToEmail}
            className="w-full text-xs text-foreground-muted hover:text-foreground underline-offset-2 hover:underline"
          >
            Use a different email
          </button>
        </form>

        {message && (
          <div
            className={`p-4 rounded-md text-sm ${
              message.type === "success"
                ? "bg-success/10 text-success border border-success/20"
                : "bg-error/10 text-error border border-error/20"
            }`}
          >
            {message.text}
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <form onSubmit={sendCode} className="space-y-4">
        <Input
          type="email"
          placeholder="you@company.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoFocus
          autoComplete="email"
        />

        {isAdminEmail && (
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="current-password"
          />
        )}

        <Button type="submit" className="w-full" isLoading={isLoading}>
          {isAdminEmail ? "Sign in" : "Send sign-in code"}
        </Button>
      </form>

      {message && (
        <div
          className={`p-4 rounded-md text-sm ${
            message.type === "success"
              ? "bg-success/10 text-success border border-success/20"
              : "bg-error/10 text-error border border-error/20"
          }`}
        >
          {message.text}
        </div>
      )}
    </>
  );
}
