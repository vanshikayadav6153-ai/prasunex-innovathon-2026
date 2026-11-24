"use client";

import { useRouter } from "next/navigation";
import { ModuleLibrary } from "@/components/ModuleLibrary";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { EnhancedStudentDashboardView } from "@/components/EnhancedStudentDashboardView";
import { useAuth } from "@/context/AuthContext";

export default function StudentDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <EnhancedStudentDashboardView
        user={user}
        embedded={false}
        onView={(view) => {
          if (view === "campus-map") router.push("/student/campus-map");
        }}
      />
      <div className="nx" id="role-modules">
        <div className="nx-wrap"><ModuleLibrary role="student" /></div>
      </div>
    </ProtectedRoute>
  );
}
