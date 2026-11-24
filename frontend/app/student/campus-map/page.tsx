"use client";

import Link from "next/link";
import { ArrowLeft, MapPin } from "lucide-react";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { IndiaCampusMap } from "@/components/IndiaCampusMap";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/Logo";

function CampusMapContent() {
  const { user } = useAuth();

  return (
    <main className="min-h-screen bg-[#F8FCF9] text-[#0B2E22]">
      <header className="border-b border-[#CDEBDD] bg-white">
        <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
          <Logo size="sm" showTagline={false} />
          <div className="flex items-center gap-3">
            <span className="hidden text-xs font-medium text-[#4B6B5E] sm:inline">
              {user?.full_name || user?.name || "Student"}
            </span>
            <Link
              href="/student/dashboard"
              className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-[#CDEBDD] px-3 text-xs font-semibold text-[#047857] transition hover:bg-[#F0FAF5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#047857]"
            >
              <ArrowLeft className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="hidden sm:inline">Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Link>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-6 sm:py-8">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-[#047857]">
          <MapPin className="h-4 w-4" aria-hidden="true" />
          Campus Finder
        </div>
        <IndiaCampusMap />
      </div>
    </main>
  );
}

export default function StudentCampusMapPage() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <CampusMapContent />
    </ProtectedRoute>
  );
}
