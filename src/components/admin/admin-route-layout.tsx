import type { ReactNode } from "react";
import { DashboardLayout } from "@/components/admin/dashboard-layout";
import { requireAdmin } from "@/server/auth/guards";

export async function AdminRouteLayout({ children }: { children: ReactNode }) {
  const { user } = await requireAdmin();

  return (
    <DashboardLayout adminEmail={user.email} adminName={user.name}>
      {children}
    </DashboardLayout>
  );
}
