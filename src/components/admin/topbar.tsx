"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RefObject } from "react";
import { useTheme } from "next-themes";
import { Menu, Moon, Sun, UserRound } from "lucide-react";
import { logoutAction } from "@/server/auth/actions";

interface TopbarProps {
  title: string;
  adminName: string;
  adminEmail: string;
  isSidebarOpen: boolean;
  onMenuClick: () => void;
  menuButtonRef: RefObject<HTMLButtonElement | null>;
}

export function Topbar({
  title,
  adminName,
  adminEmail,
  isSidebarOpen,
  onMenuClick,
  menuButtonRef,
}: TopbarProps) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const initials = adminName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  useEffect(() => setMounted(true), []);

  return (
    <header className="admin-topbar sticky top-0 z-30 flex min-h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/90 px-4 backdrop-blur dark:border-slate-800 dark:bg-slate-950/85 sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          aria-label="Open navigation"
          aria-controls="admin-sidebar"
          aria-expanded={isSidebarOpen}
          className="admin-icon-button grid size-9 shrink-0 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
          onClick={onMenuClick}
          ref={menuButtonRef}
          type="button"
        >
          <Menu aria-hidden="true" size={18} />
        </button>
        <h1 className="admin-page-title truncate text-base font-semibold tracking-tight text-slate-900 dark:text-slate-100 sm:text-lg">
          {title}
        </h1>
      </div>

      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <button
          aria-label={
            mounted
              ? `Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`
              : "Toggle theme"
          }
          className="admin-icon-button grid size-9 place-items-center rounded-md border border-slate-200 text-slate-600 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
          type="button"
        >
          {mounted && resolvedTheme === "dark" ? (
            <Sun aria-hidden="true" size={17} />
          ) : (
            <Moon aria-hidden="true" size={17} />
          )}
        </button>

        <details className="group relative">
          <summary className="admin-account-trigger flex min-h-9 cursor-pointer list-none items-center gap-2 rounded-md p-1.5 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:hover:bg-slate-800 [&::-webkit-details-marker]:hidden">
            <span className="admin-avatar grid size-7 place-items-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300">
              {initials}
            </span>
            <span className="hidden text-left sm:block">
              <span className="block text-xs font-medium leading-4 text-slate-800 dark:text-slate-200">
                {adminName}
              </span>
              <span className="block text-[10px] leading-4 text-slate-500">
                {adminEmail}
              </span>
            </span>
          </summary>
          <div className="absolute right-0 top-[calc(100%+0.5rem)] z-40 w-48 rounded-lg border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-700 dark:bg-slate-900">
            <Link
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-200 dark:hover:bg-slate-800"
              href="/admin/profile"
            >
              <UserRound aria-hidden="true" size={16} />
              Profile settings
            </Link>
            <form action={logoutAction}>
              <button
                className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-500 hover:bg-slate-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-500 dark:text-slate-400 dark:hover:bg-slate-800"
                type="submit"
              >
                Sign out
              </button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}
