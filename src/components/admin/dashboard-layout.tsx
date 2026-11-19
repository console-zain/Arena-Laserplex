"use client";

import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/sidebar";
import { Topbar } from "@/components/admin/topbar";

const pageTitles: Readonly<Record<string, string>> = {
  "/admin/dashboard": "Dashboard",
  "/admin/movies": "Movies",
  "/admin/movies/create": "Create movie",
  "/admin/movies/edit": "Edit movie",
  "/admin/upcoming": "Upcoming movies",
  "/admin/upcoming/create": "Add upcoming movie",
  "/admin/events": "Events",
  "/admin/news": "News",
  "/admin/bookings": "Bookings",
  "/admin/screens": "Screens",
  "/admin/showtimes": "Showtimes",
  "/admin/promotions": "Promotions",
  "/admin/settings": "Settings",
  "/admin/profile": "Profile",
};

interface DashboardLayoutProps {
  children: ReactNode;
  adminName: string;
  adminEmail: string;
}

export function DashboardLayout({
  children,
  adminName,
  adminEmail,
}: DashboardLayoutProps) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const title =
    pageTitles[pathname] ??
    (pathname.startsWith("/admin/showtimes/") ? "Edit showtime" : undefined) ??
    (pathname.startsWith("/admin/movies/edit") ? "Edit movie" : "Admin");

  useEffect(() => {
    if (!sidebarOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSidebarOpen(false);
        menuButtonRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [sidebarOpen]);

  function closeSidebar() {
    setSidebarOpen(false);
    menuButtonRef.current?.focus();
  }

  return (
    <div className="admin-shell min-h-screen antialiased">
      <a
        className="admin-skip-link fixed left-3 top-3 z-[60] -translate-y-24 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white focus:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400"
        href="#admin-main-content"
      >
        Skip to main content
      </a>
      {sidebarOpen ? (
        <button
          aria-label="Close navigation"
          className="admin-sidebar-backdrop fixed inset-0 z-40 bg-slate-950/60 lg:hidden"
          onClick={closeSidebar}
          type="button"
        />
      ) : null}
      <div className="flex min-h-screen">
        <Sidebar
          isOpen={sidebarOpen}
          onClose={closeSidebar}
        />
        <div className="flex min-h-screen min-w-0 flex-1 flex-col">
          <Topbar
            adminEmail={adminEmail}
            adminName={adminName}
            isSidebarOpen={sidebarOpen}
            onMenuClick={() => setSidebarOpen(true)}
            menuButtonRef={menuButtonRef}
            title={title}
          />
          <main
            className="admin-main flex-1 px-4 py-6 sm:px-6 sm:py-8 lg:px-8"
            id="admin-main-content"
            tabIndex={-1}
          >
            <div className="mx-auto w-full max-w-[1440px]">{children}</div>
          </main>
          <footer className="admin-footer border-t border-slate-200 px-4 py-4 text-center text-xs text-slate-500 dark:border-slate-800 dark:text-slate-500 sm:px-6 lg:px-8">
            Arena Laserplex <span aria-hidden="true">·</span> Admin workspace
          </footer>
        </div>
      </div>
    </div>
  );
}
