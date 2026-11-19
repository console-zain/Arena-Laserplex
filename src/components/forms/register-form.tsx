"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/common/button";
import { Card, CardContent } from "@/components/common/card";
import { registerAction } from "@/app/(public)/register/actions";
import type { AuthActionState } from "@/server/auth/schemas";

const fieldClassName =
  "mt-2 min-h-12 w-full rounded-[var(--v3-radius-input)] border border-[var(--v3-border)] bg-[var(--v3-surface-elevated)] px-4 py-3 text-[var(--v3-text-primary)] outline-none transition-colors placeholder:text-[var(--v3-text-muted)] focus-visible:border-[var(--v3-focus-ring)] focus-visible:ring-2 focus-visible:ring-[var(--v3-focus-ring)]/20";
const initialAuthActionState: AuthActionState = {};

interface RegisterFormProps {
  returnTo?: string;
}

export function RegisterForm({ returnTo }: RegisterFormProps) {
  const [state, formAction, isPending] = useActionState(
    registerAction,
    initialAuthActionState,
  );

  return (
    <Card>
      <CardContent>
        <form action={formAction} className="grid gap-5">
          {returnTo ? (
            <input name="returnTo" type="hidden" value={returnTo} />
          ) : null}
          <div>
            <label className="text-sm font-semibold" htmlFor="register-name">
              Full name
            </label>
            <input
              autoComplete="name"
              className={fieldClassName}
              id="register-name"
              maxLength={80}
              name="name"
              placeholder="Your full name"
              required
            />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="register-email">
              Email address
            </label>
            <input
              autoComplete="email"
              className={fieldClassName}
              id="register-email"
              maxLength={254}
              name="email"
              placeholder="you@example.com"
              required
              type="email"
            />
          </div>
          <div>
            <label className="text-sm font-semibold" htmlFor="register-password">
              Password
            </label>
            <input
              autoComplete="new-password"
              className={fieldClassName}
              id="register-password"
              minLength={8}
              maxLength={128}
              name="password"
              placeholder="At least 8 characters"
              required
              type="password"
            />
          </div>
          <div>
            <label
              className="text-sm font-semibold"
              htmlFor="register-confirm-password"
            >
              Confirm password
            </label>
            <input
              autoComplete="new-password"
              className={fieldClassName}
              id="register-confirm-password"
              minLength={8}
              maxLength={128}
              name="confirmPassword"
              placeholder="Enter your password again"
              required
              type="password"
            />
          </div>
          <Button className="w-full" disabled={isPending} type="submit">
            Create Account
            <ArrowRight aria-hidden="true" size={16} />
          </Button>
          <p
            aria-live="polite"
            className="m-0 text-sm text-red-600 dark:text-red-400"
            role="alert"
          >
            {state.error}
          </p>
          <p className="m-0 text-center text-sm text-[var(--muted)]">
            Already have an account?{" "}
            <Link
              className="inline-flex min-h-11 items-center font-semibold text-[var(--v3-accent-primary)] underline-offset-4 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--v3-focus-ring)]"
              href={
                returnTo
                  ? `/login?returnTo=${encodeURIComponent(returnTo)}`
                  : "/login"
              }
            >
              Sign in
            </Link>
          </p>
        </form>
      </CardContent>
    </Card>
  );
}
