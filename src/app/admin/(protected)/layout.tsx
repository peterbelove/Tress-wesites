import type { Metadata } from "next";
import type { ReactNode } from "react";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import { logoutAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "TRES Admin", robots: { index: false, follow: false } };

export default async function ProtectedAdminLayout({ children }: { children: ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-screen bg-mist text-ink lg:flex">
      <AdminSidebar userName={user.name || user.email} logout={logoutAction} />
      <div className="min-w-0 flex-1">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-10">{children}</div>
      </div>
    </div>
  );
}
