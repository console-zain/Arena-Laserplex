"use client";

import { useActionState } from "react";
import { adminLoginAction } from "@/app/(admin-auth)/admin/login/actions";
import type { AuthActionState } from "@/server/auth/schemas";

const initialAuthActionState: AuthActionState = {};

const fieldClassName =
  "mt-1.5 min-h-11 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

export function AdminLoginForm() {
  const [state, formAction, isPending] = useActionState(
    adminLoginAction,
    initialAuthActionState,
  );

  return (
    <form action={formAction} className="admin-login-form grid gap-5">
      <div>
        <label
          className="text-sm font-medium text-slate-200"
          htmlFor="admin-login-email"
        >
          Email address
        </label>
        <input
          autoComplete="username"
          className={fieldClassName}
          id="admin-login-email"
          maxLength={254}
          name="email"
          placeholder="admin@example.com"
          required
          type="email"
        />
      </div>
      <div>
        <label
          className="text-sm font-medium text-slate-200"
          htmlFor="admin-login-password"
        >
          Password
        </label>
        <input
          autoComplete="current-password"
          className={fieldClassName}
          id="admin-login-password"
          maxLength={128}
          minLength={8}
          name="password"
          placeholder="Enter your password"
          required
          type="password"
        />
      </div>
      <button
        className="admin-primary-button inline-flex min-h-11 items-center justify-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? "Signing in..." : "Sign in"}
      </button>
      <p
        aria-live="polite"
        className="m-0 text-sm text-red-400"
        role="alert"
      >
        {state.error}
      </p>
    </form>
  );
}
