"use client";

import { ReviewWorkspace } from "@/components/ReviewWorkspace";
import { ModuleLibrary } from "@/components/ModuleLibrary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AdminDashboardView } from "@/components/AdminDashboardView";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "dean", "chancellor_dean"]}>
      <aside className="bg-slate-100 p-2 text-center text-sm text-slate-800">
        DEMO workspace - Fictitious records -{" "}
        <a className="underline" href="#role-modules">Explore modules</a>
      </aside>
      <AdminDashboardView />
      <div className="nx" id="role-modules">
        <div className="nx-wrap">
          <ReviewWorkspace role="admin" />
          <ModuleLibrary role="admin" />
        </div>
      </div>
    </ProtectedRoute>
  );
}
