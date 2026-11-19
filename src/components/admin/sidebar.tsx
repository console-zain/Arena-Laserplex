"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Clapperboard,
  FileText,
  Gauge,
  Gift,
  LayoutDashboard,
  MonitorPlay,
  Settings,
  Theater,
  Ticket,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

const navigation = [
  { label: "Dashboard", href: "/admin/dashboard", Icon: LayoutDashboard },
  { label: "Movies", href: "/admin/movies", Icon: Clapperboard },
  { label: "Upcoming", href: "/admin/upcoming", Icon: CalendarDays },
  { label: "Events", href: "/admin/events", Icon: CalendarDays },
  { label: "News", href: "/admin/news", Icon: FileText },
  { label: "Bookings", href: "/admin/bookings", Icon: Ticket },
  { label: "Screens", href: "/admin/screens", Icon: MonitorPlay },
  { label: "Showtimes", href: "/admin/showtimes", Icon: Theater },
  { label: "Promotions", href: "/admin/promotions", Icon: Gift },
  { label: "Settings", href: "/admin/settings", Icon: Settings },
  { label: "Profile", href: "/admin/profile", Icon: Gauge },
] as const;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 1023px)");
    const updateViewport = () => setIsMobile(mediaQuery.matches);

    updateViewport();
    mediaQuery.addEventListener("change", updateViewport);
    return () => mediaQuery.removeEventListener("change", updateViewport);
  }, []);

  return (
    <aside
      id="admin-sidebar"
      aria-label="Admin sidebar"
      aria-hidden={isMobile && !isOpen}
      className={`admin-sidebar fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-slate-950 text-slate-100 transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
      inert={isMobile && !isOpen}
    >
      <div className="admin-sidebar-header flex h-16 items-center justify-between border-b border-slate-800 px-5">
        <Link
          className="admin-sidebar-brand flex items-center gap-3 rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-400"
          href="/admin/dashboard"
          onClick={onClose}
        >
          <span className="arena-monogram size-8">
            A
          </span>
          <span className="text-sm font-semibold tracking-tight">
            Arena Admin
          </span>
        </Link>
        <button
          aria-label="Close navigation"
          aria-controls="admin-sidebar"
          className="grid size-9 place-items-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 lg:hidden"
          onClick={onClose}
          type="button"
        >
          <X aria-hidden="true" size={19} />
        </button>
      </div>

      <nav aria-label="Admin navigation" className="flex-1 overflow-y-auto p-3">
        <p className="admin-sidebar-label mb-2 mt-3 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Workspace
        </p>
        <ul className="m-0 grid list-none gap-1 p-0">
          {navigation.map(({ label, href, Icon }) => {
            const isActive =
              pathname === href ||
              (href !== "/admin/dashboard" && pathname.startsWith(`${href}/`));

            return (
              <li key={href}>
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={`admin-nav-link flex min-h-10 items-center gap-3 rounded-md px-3 text-[13px] font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400 ${
                    isActive
                      ? "bg-indigo-500/15 text-indigo-300"
                      : "text-slate-400 hover:bg-slate-900 hover:text-slate-100"
                  }`}
                  href={href}
                  onClick={onClose}
                >
                  <Icon aria-hidden="true" size={17} />
                  {label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="admin-sidebar-footer border-t border-slate-800 p-4">
        <div className="rounded-lg border border-slate-800 bg-slate-900/70 p-3">
          <p className="m-0 text-xs font-medium text-slate-200">
            Arena Laserplex
          </p>
          <p className="mb-0 mt-1 text-[11px] text-slate-500">
            Admin workspace · Demo
          </p>
        </div>
      </div>
    </aside>
  );
}
