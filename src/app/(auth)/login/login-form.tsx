"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";

// Admin domain — emails ending in this trigger password auth.
// Magic link is used for every other email.
const ADMIN_DOMAIN = "@mondayandpartners.com";

// Human-readable copy for the few error tokens we redirect with from the
// auth callback routes. Anything else falls through to the raw token so it's
// still surfaced rather than swallowed.
const AUTH_ERROR_MESSAGES: Record<string, string> = {
  auth_failed:
    "That link couldn't be used. It may have expired or already been opened. Request a new one below.",
};

export function LoginForm() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/projects";

  const incomingErrorToken = searchParams.get("error");
  const incomingError = incomingErrorToken
    ? AUTH_ERROR_MESSAGES[incomingErrorToken] || incomingErrorToken
    : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<
    { type: "success" | "error"; text: string } | null
  >(
    incomingError ? { type: "error", text: incomingError } : null
  );

  const isAdminEmail = email.toLowerCase().endsWith(ADMIN_DOMAIN);

  const handleSubmit = async (e: React.FormEvent) => {
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
        // Middleware will resolve the destination on next navigation.
        window.location.href = redirectTo;
      }
    } else {
      // IMPORTANT: route the magic link through the CLIENT-side /auth/callback
      // page, not the server-side /api/auth/callback. Email security scanners
      // (Gmail, M365 Defender, etc.) pre-fetch links to scan them. The server
      // route would attempt the PKCE exchange on that scanner hit — without
      // a code_verifier cookie it fails, and Supabase may treat the token as
      // consumed, breaking the real click. The client page only runs the
      // exchange when JS executes in the user's actual browser, so scanners
      // can't burn the token before the user gets there.
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
        },
      });

      setIsLoading(false);

      if (error) {
        setMessage({
          type: "error",
          text: error.message || "Something went wrong. Please try again.",
        });
      } else {
        setMessage({
          type: "success",
          text: "Check your email for a login link.",
        });
      }
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          {isAdminEmail ? "Sign in" : "Send Login Link"}
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
