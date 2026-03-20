import { Suspense } from "react";
import { Logo } from "@/components/layout";
import { LoginForm } from "./login-form";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <div className="flex justify-center">
          <Logo size="lg" href={undefined} />
        </div>

        {/* Title */}
        <div className="text-center space-y-2">
          <h1 className="text-xl font-semibold text-foreground">
            Client Portal
          </h1>
          <p className="text-sm text-foreground-muted">
            Enter your email to access your project.
          </p>
        </div>

        {/* Form wrapped in Suspense */}
        <Suspense fallback={<LoginFormSkeleton />}>
          <LoginForm />
        </Suspense>

        {/* Help text */}
        <p className="text-center text-xs text-foreground-subtle">
          You&apos;ll receive a link that logs you in instantly.
          <br />
          No password needed.
        </p>
      </div>
    </div>
  );
}

function LoginFormSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 bg-surface-800 rounded-md" />
      <div className="h-10 bg-surface-800 rounded-md" />
    </div>
  );
}
