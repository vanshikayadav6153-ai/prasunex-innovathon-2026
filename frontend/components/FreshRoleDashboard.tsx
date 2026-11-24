"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowRight, BookOpenCheck, Sparkles, X, LogOut } from "lucide-react";
import { Logo } from "@/components/Logo";
import { AuthUser } from "@/context/AuthContext";

const TOUR_STEPS = [
  {
    title: "Welcome To Your Workspace",
    description: "Your account is ready. This workspace will show your campus information as it becomes available.",
  },
  {
    title: "Your Numbers Start Fresh",
    description: "New accounts begin with zero stats. Sample campus data will not be presented as your own.",
  },
  {
    title: "Explore When You’re Ready",
    description: "Your dashboard will grow as your campus links your courses, records, and activity.",
  },
];

interface FreshRoleDashboardProps {
  user: AuthUser;
  roleLabel: string;
  metrics: string[];
  onLogout: () => void;
}

export function FreshRoleDashboard({
  user,
  roleLabel,
  metrics,
  onLogout,
}: FreshRoleDashboardProps) {
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);

  useEffect(() => {
    try {
      setTourOpen(localStorage.getItem(`nexus_role_tour_complete:${user.id}`) !== "true");
    } catch (error) {
      console.error("Could not read role tour status:", error);
    }
  }, [user.id]);

  const closeTour = useCallback(() => {
    try {
      localStorage.setItem(`nexus_role_tour_complete:${user.id}`, "true");
    } catch (error) {
      console.error("Could not save role tour status:", error);
    }
    setTourOpen(false);
  }, [user.id]);

  useEffect(() => {
    if (!tourOpen) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTour();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [closeTour, tourOpen]);

  return (
    <div className="min-h-screen bg-white text-[#0B2E22]">
      <header className="sticky top-0 z-40 border-b border-[#CDEBDD] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(11,46,34,0.06)] sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <Logo size="sm" showTagline={false} />
          <div className="flex min-w-0 items-center gap-3">
            <span className="hidden truncate text-xs font-semibold text-[#4B6B5E] sm:inline">
              {roleLabel} Workspace
            </span>
            <button
              type="button"
              onClick={onLogout}
              className="shrink-0 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 flex items-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <section className="rounded-2xl border border-[#CDEBDD] bg-[#F0FAF5] p-6 shadow-[0_1px_2px_rgba(11,46,34,0.06)] sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-[#047857]">{roleLabel} workspace</p>
          <h1 className="mt-2 break-words text-2xl font-extrabold text-[#0B2E22] sm:text-3xl [text-wrap:balance]">
            Welcome, {user.full_name?.split(" ")[0] || "User"}
          </h1>
          <p className="mt-2 max-w-2xl break-words text-sm leading-relaxed text-[#4B6B5E]">
            Your account is ready. These stats start at zero and will show your real campus information when it becomes available.
          </p>
          <button
            type="button"
            onClick={() => {
              setTourStep(0);
              setTourOpen(true);
            }}
            className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] px-4 py-2.5 text-xs font-bold text-[#0B2E22] shadow-sm transition-colors"
          >
            <Sparkles className="h-4 w-4" aria-hidden="true" />
            Start Dashboard Tour
          </button>
        </section>

        <section aria-label="Your current stats" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <div key={metric} className="min-w-0 rounded-xl border border-[#CDEBDD] bg-[#F0FAF5] p-5 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
              <div className="flex items-start justify-between gap-3">
                <h2 className="min-w-0 break-words text-xs font-bold uppercase tracking-wide text-[#4B6B5E]">{metric}</h2>
                <BookOpenCheck className="h-4 w-4 shrink-0 text-[#047857]" aria-hidden="true" />
              </div>
              <p className="mt-3 text-3xl font-extrabold tabular-nums text-[#0B2E22]">0</p>
              <p className="mt-1 text-xs font-semibold text-[#047857]">Initialized</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-[#CDEBDD] bg-white p-5 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
          <h2 className="text-base font-bold text-[#0B2E22]">No campus records yet</h2>
          <p className="mt-2 max-w-2xl break-words text-sm leading-relaxed text-[#4B6B5E]">
            Your dashboard will fill in when your institution makes your records available. You can sign in again with this account to return here.
          </p>
        </section>
      </main>

      {tourOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-tour-title"
            aria-describedby="role-tour-description"
            className="w-full max-w-lg rounded-2xl border border-[#CDEBDD] bg-white p-6 shadow-xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-bold text-[#047857]">Dashboard Tour · {tourStep + 1} of {TOUR_STEPS.length}</p>
                <h2 id="role-tour-title" className="mt-2 text-xl font-bold text-[#0B2E22] [text-wrap:balance]">{TOUR_STEPS[tourStep].title}</h2>
              </div>
              <button
                type="button"
                onClick={closeTour}
                aria-label="Close tour"
                className="shrink-0 rounded-lg p-1.5 text-[#4B6B5E] hover:bg-[#F0FAF5] hover:text-[#0B2E22]"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p id="role-tour-description" aria-live="polite" className="mt-4 text-sm leading-relaxed text-[#4B6B5E]">
              {TOUR_STEPS[tourStep].description}
            </p>
            <div className="mt-6 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeTour}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-[#4B6B5E] hover:text-[#0B2E22]"
              >
                Skip Tour
              </button>
              <div className="flex gap-2">
                {tourStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setTourStep((step) => Math.max(0, step - 1))}
                    className="rounded-lg border border-[#CDEBDD] px-3 py-2 text-xs font-semibold text-[#4B6B5E] hover:bg-[#F0FAF5]"
                  >
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => {
                    if (tourStep === TOUR_STEPS.length - 1) closeTour();
                    else setTourStep((step) => Math.min(TOUR_STEPS.length - 1, step + 1));
                  }}
                  className="inline-flex items-center gap-1 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] px-4 py-2 text-xs font-bold text-[#0B2E22] shadow-sm transition-colors"
                >
                  {tourStep === TOUR_STEPS.length - 1 ? "Finish Tour" : "Next"}
                  <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
