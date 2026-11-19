"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/common/button";
import { Card, CardContent } from "@/components/common/card";
import { loginAction } from "@/app/(public)/login/actions";
import type { AuthActionState } from "@/server/auth/schemas";

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-[var(--v3-radius-input)] border border-[var(--v3-border)] bg-[var(--v3-surface-elevated)] px-4 py-3 text-[var(--v3-text-primary)] outline-none transition-colors placeholder:text-[var(--v3-text-muted)] focus-visible:border-[var(--v3-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--v3-focus-ring)]/20";
const initialAuthActionState: AuthActionState = {};

interface LoginFormProps {
  returnTo?: string;
}

export function LoginForm({ returnTo }: LoginFormProps) {
  const [state, formAction, isPending] = useActionState(
    loginAction,
    initialAuthActionState,
  );
  const [message, setMessage] = useState("");

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="grid gap-5">
          {returnTo ? (
            <input name="returnTo" type="hidden" value={returnTo} />
          ) : null}
          <div>
            <label className="text-sm font-semibold" htmlFor="login-email">
              Email address
            </label>
            <input
              autoComplete="email"
              className={fieldClassName}
              id="login-email"
              maxLength={254}
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>
          <div>
            <div className="flex items-center justify-between gap-3">
              <label className="text-sm font-semibold" htmlFor="login-password">
                Password
              </label>
              <button
                className="inline-flex min-h-11 items-center rounded-sm text-sm font-medium text-[var(--v3-accent-primary)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v3-focus-ring)]"
                onClick={() =>
                  setMessage("Password recovery is not available yet.")
                }
                type="button"
              >
                Forgot password?
              </button>
            </div>
            <input
              autoComplete="current-password"
              className={fieldClassName}
              id="login-password"
              name="password"
              minLength={8}
              maxLength={128}
              placeholder="Enter your password"
              required
              type="password"
            />
          </div>
          <Button className="w-full" disabled={isPending} type="submit">
            Sign In
            <ArrowRight aria-hidden="true" size={16} />
          </Button>
          <p
            aria-live="polite"
            className="m-0 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.error}
          </p>
          <p
            aria-live="polite"
            className="m-0 text-sm text-[var(--v3-accent-primary)]"
          >
            {message}
          </p>
          <p className="m-0 text-center text-sm text-[var(--muted)]">
            Need an account?{" "}
            <Link
              className="inline-flex min-h-11 items-center font-semibold text-[var(--v3-accent-primary)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v3-focus-ring)]"
              href={
                returnTo
                  ? `/register?returnTo=${encodeURIComponent(returnTo)}`
                  : "/register"
              }
            >
              Create an account
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
