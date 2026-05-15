"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

/**
 * Universal auth callback page.
 *
 * Handles both auth flows Supabase emits depending on how the link was created:
 *   - PKCE code flow (normal signInWithOtp from the login form): /auth/callback?code=...
 *   - Implicit/hash flow (admin.generateLink scripts): /auth/callback#access_token=...&refresh_token=...
 *
 * Reads either, establishes the session, and redirects to the next destination
 * (defaults to /projects). Client component because hash fragments are not
 * sent to the server.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function handleAuth() {
      const supabase = createClient();

      const hashRaw = window.location.hash.startsWith("#")
        ? window.location.hash.slice(1)
        : window.location.hash;
      const hashParams = new URLSearchParams(hashRaw);
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      const searchParams = new URLSearchParams(window.location.search);
      const code = searchParams.get("code");
      const next =
        searchParams.get("next") ||
        searchParams.get("redirect") ||
        "/projects";

      // Hash flow (admin.generateLink links land here)
      if (accessToken && refreshToken) {
        const { error: setError_ } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        if (cancelled) return;
        if (setError_) {
          setError(setError_.message);
          return;
        }
        // Clear the hash so the next page doesn't keep it around
        window.history.replaceState(null, "", window.location.pathname);
        router.replace(next);
        return;
      }

      // PKCE code flow (typical user-facing signInWithOtp)
      if (code) {
        const { error: exchangeError } =
          await supabase.auth.exchangeCodeForSession(code);
        if (cancelled) return;
        if (exchangeError) {
          setError(exchangeError.message);
          return;
        }
        router.replace(next);
        return;
      }

      setError("No auth tokens or code found in the URL.");
    }

    handleAuth();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-sm text-center space-y-3">
        {error ? (
          <>
            <h1 className="text-lg font-semibold text-foreground">
              Sign-in failed
            </h1>
            <p className="text-sm text-foreground-muted">{error}</p>
            <p className="text-sm">
              <a href="/login" className="underline">
                Back to sign in
              </a>
            </p>
          </>
        ) : (
          <>
            <h1 className="text-lg font-semibold text-foreground">
              Signing you in…
            </h1>
            <p className="text-sm text-foreground-muted">
              One moment.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
