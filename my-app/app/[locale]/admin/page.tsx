"use client";

import { Column } from "@/app/components2/column/column";
import AdminDashboardShell from "./admin-dashboard-shell";

export default function AdminPage() {
  return (
    <AdminDashboardShell>
      <Column />
    </AdminDashboardShell>
  );
}
