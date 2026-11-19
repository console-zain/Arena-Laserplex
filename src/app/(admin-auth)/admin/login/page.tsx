import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "@/components/admin/admin-login-form";

export default function AdminLoginPage() {
  return (
    <main className="admin-shell admin-login-screen flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-slate-100">
      <a
        className="admin-skip-link fixed left-3 top-3 z-10 -translate-y-24 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white focus:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        href="#admin-login-form"
      >
        Skip to sign in
      </a>
      <div className="w-full max-w-md">
        <Link
          className="admin-login-brand mb-8 inline-flex items-center gap-3 rounded-sm text-sm font-semibold text-slate-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400"
          href="/"
        >
          <span className="arena-monogram size-9">
            A
          </span>
          Arena Laserplex
        </Link>
        <div className="admin-login-card rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl shadow-black/20 sm:p-8">
          <div className="mb-6">
            <h1 className="m-0 text-2xl font-semibold tracking-tight">
              Admin sign in
            </h1>
            <p className="mb-0 mt-2 text-sm leading-6 text-slate-400">
              Enter your workspace credentials to continue.
            </p>
          </div>
          <div id="admin-login-form" tabIndex={-1}>
            <AdminLoginForm />
          </div>
          <p className="mb-0 mt-5 flex items-center justify-center gap-2 text-xs text-slate-500">
            <ShieldCheck aria-hidden="true" size={14} />
            Sign in is restricted to active administrator accounts.
          </p>
        </div>
        <p className="mb-0 mt-6 text-center text-xs text-slate-500">
          Arena Laserplex internal workspace
        </p>
      </div>
    </main>
  );
}
