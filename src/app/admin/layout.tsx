import React from "react";
import { SidebarAdmin } from "@/components/SidebarAdmin";
import { AdminHeader } from "@/components/AdminHeader";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-screen overflow-hidden bg-zinc-950 text-zinc-50 flex">
      {/* Persistent Sidebar with matching h-16 header */}
      <SidebarAdmin />

      {/* Main Column with Fixed Top Header and Scrollable Content */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Fixed Header */}
        <AdminHeader />

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
