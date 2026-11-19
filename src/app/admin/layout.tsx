import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminRouteLayout } from "@/components/admin/admin-route-layout";
import "@/styles/admin-v4.css";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "%s | Arena Laserplex Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <AdminRouteLayout>{children}</AdminRouteLayout>;
}
