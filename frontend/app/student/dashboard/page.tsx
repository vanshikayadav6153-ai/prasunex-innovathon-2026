"use client";

import { ModuleLibrary } from "@/components/ModuleLibrary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EnhancedStudentDashboardView } from "@/components/EnhancedStudentDashboardView";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboardPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <aside className="bg-slate-100 p-2 text-center text-sm text-slate-800">
        DEMO workspace - Fictitious records -{" "}
        <a className="underline" href="#role-modules">Explore modules</a>
      </aside>
      <EnhancedStudentDashboardView user={user} embedded={false} />
      <div className="nx" id="role-modules">
        <div className="nx-wrap"><ModuleLibrary role="student" /></div>
      </div>
    </ProtectedRoute>
  );
}
