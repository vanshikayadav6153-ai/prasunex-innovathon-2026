"use client";

import { ReviewWorkspace } from "@/components/ReviewWorkspace";
import { ModuleLibrary } from "@/components/ModuleLibrary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { FacultyDashboardView } from "@/components/FacultyDashboardView";

export default function FacultyDashboardPage() {
  return (
    <ProtectedRoute allowedRoles={["faculty", "professor", "hod", "professor_hod"]}>
      <aside className="bg-slate-100 p-2 text-center text-sm text-slate-800">
        DEMO workspace - Fictitious records -{" "}
        <a className="underline" href="#role-modules">Explore modules</a>
      </aside>
      <FacultyDashboardView />
      <div className="nx" id="role-modules">
        <div className="nx-wrap">
          <ReviewWorkspace role="faculty" />
          <ModuleLibrary role="faculty" />
        </div>
      </div>
    </ProtectedRoute>
  );
}
