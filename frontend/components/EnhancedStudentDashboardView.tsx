"use client";

import {ThemeToggle} from "./ThemeToggle";
import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LayoutDashboard,
  GraduationCap,
  Compass,
  LineChart as LineChartIcon,
  CalendarDays,
  Brain,
  Bot,
  ShieldAlert,
  Sparkles,
  Settings,
  Search,
  Bell,
  ChevronDown,
  ArrowRight,
  ArrowUpRight,
  Check,
  Send,
  Calendar,
  Shield,
  BookOpen,
  User,
  Sliders,
  CheckCircle2,
  LogOut,
  X,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { KpiCard } from "@/components/KpiCard";
import { ProgressBar } from "@/components/ProgressBar";
import { DashboardTopNavbar, NavItem } from "@/components/DashboardTopNavbar";
import {
  KPI_CARDS,
  MASTERY_COURSES,
  AI_RECOMMENDATION,
  UPCOMING_ACTIVITIES,
  QUICK_ACCESS_ITEMS,
  COPILOT_PRESETS,
  CopilotMessage,
} from "@/data/student";

interface EnhancedStudentDashboardViewProps {
  user?: any;
  onView?: (view: string) => void;
  onNotify?: (text: string, kind?: any) => void;
  onBackToLanding?: () => void;
  onLogout?: () => void;
  embedded?: boolean;
}

const STUDENT_TOUR_STEPS = [
  {
    title: "Welcome To Your Dashboard",
    description: "This is your personal student workspace. Your profile is ready, and your academic data will appear when it is available from campus.",
  },
  {
    title: "Find Your Tools",
    description: "Use the top navigation on desktop, or open the menu on mobile, to explore learning, planning, attendance, and campus services.",
  },
  {
    title: "Your Progress Starts Fresh",
    description: "New accounts start with zero academic stats. We do not show sample grades or attendance as if they were yours.",
  },
  {
    title: "Pick Up Where You Left Off",
    description: "Your dashboard interactions are saved in this browser for your account. Sign in again here to restore them.",
  },
];

function FreshStudentDashboard({
  user,
  onStartTour,
}: {
  user?: any;
  onStartTour: () => void;
}) {
  const zeroKpis = KPI_CARDS.map((item) => ({
    ...item,
    value: item.id === "assessments" ? "0" : "0%",
    change: "New",
    trend: "neutral" as const,
    linkText: undefined,
    sparkline: item.sparkline.map(({ x }) => ({ x, y: 0 })),
  }));

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-mint-400/30 bg-darkEmerald-900/80 p-6 shadow-2xl sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-mint-300">Your CAMPUS-NEXUS workspace</p>
        <h1 className="mt-2 text-2xl font-extrabold text-white sm:text-3xl [text-wrap:balance]">
          Welcome, {user?.full_name?.split(" ")[0] || "Student"}
        </h1>
        <p className="mt-2 max-w-2xl break-words text-sm leading-relaxed text-mint-accent/80">
          Your account is ready. This dashboard starts with zero stats and will show your actual course data when it becomes available.
        </p>
        <button
          type="button"
          onClick={onStartTour}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-mint-400 px-4 py-2.5 text-sm font-bold text-darkEmerald-950 transition-colors hover:bg-mint-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-300"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          Start Dashboard Tour
        </button>
      </section>

      <section aria-label="Your current stats" className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {zeroKpis.map((item) => <KpiCard key={item.id} item={item} />)}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="min-w-0 rounded-2xl border border-mint-400/20 bg-darkEmerald-900/70 p-5">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 shrink-0 text-mint-400" aria-hidden="true" />
            <h2 className="text-base font-bold text-white">Learning Progress</h2>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-mint-accent/75">
            No course progress has been recorded yet. Your mastery map will update when real course activity is available.
          </p>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-darkEmerald-950">
            <div className="h-full w-0 bg-mint-400" />
          </div>
          <p className="mt-2 text-xs text-mint-accent/60">0% complete · No course data yet</p>
        </div>

        <div className="min-w-0 rounded-2xl border border-mint-400/20 bg-darkEmerald-900/70 p-5">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 shrink-0 text-mint-400" aria-hidden="true" />
            <h2 className="text-base font-bold text-white">Your Next Steps</h2>
          </div>
          <ol className="mt-4 space-y-3 text-sm text-mint-accent/80">
            <li className="flex gap-3"><span className="font-bold text-mint-300">1.</span><span>Explore the dashboard tour.</span></li>
            <li className="flex gap-3"><span className="font-bold text-mint-300">2.</span><span>Open your learning tools from the navigation.</span></li>
            <li className="flex gap-3"><span className="font-bold text-mint-300">3.</span><span>Return later to continue from this account.</span></li>
          </ol>
        </div>
      </section>
    </div>
  );
}

export function EnhancedStudentDashboardView({
  user,
  onView,
  onNotify,
  onBackToLanding,
  onLogout,
  embedded = false,
}: EnhancedStudentDashboardViewProps) {
  const isNewAccount = user?.is_new_account === true;
  const progressKey = user?.id ? `nexus_student_progress:${user.id}` : null;

  const [activeMenu, setActiveMenu] = useState("overview");
  const [progressLoaded, setProgressLoaded] = useState(false);
  const [tourOpen, setTourOpen] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Grade Predictor Interactive Effort Slider
  const [effortLevel, setEffortLevel] = useState(isNewAccount ? 0 : 10);
  const getPredictedGradeInfo = (effort: number) => {
    const base = 78;
    const calculatedScore = Math.min(100, Math.round(base + (effort / 20) * 10));
    let grade = "B+";
    if (calculatedScore >= 88) grade = "A";
    else if (calculatedScore >= 83) grade = "A-";
    else if (calculatedScore >= 78) grade = "B+";
    else grade = "B";

    return {
      score: calculatedScore,
      gradeTransition: `B+ → ${grade} (${calculatedScore}%)`,
      points: [
        { name: "Current", score: 78 },
        { name: "+10% Effort", score: 83 },
        { name: "+20% Effort", score: calculatedScore },
      ],
    };
  };

  const currentPrediction = getPredictedGradeInfo(effortLevel);

  // Interactive Checklist for AI Study Recommendation
  const [recommendationActions, setRecommendationActions] = useState(
    isNewAccount ? [] : AI_RECOMMENDATION.actions
  );
  const [studyPlanGenerated, setStudyPlanGenerated] = useState(false);

  const toggleAction = (id: string) => {
    setRecommendationActions((prev) =>
      prev.map((a) => (a.id === id ? { ...a, completed: !a.completed } : a))
    );
  };

  // NEXUS AI Copilot Chat State
  const [messages, setMessages] = useState<CopilotMessage[]>([
    {
      id: "msg-0",
      sender: "bot",
      text: isNewAccount
        ? "Welcome to CAMPUS-NEXUS. Your course data will appear here as your campus shares it."
        : "Hi Student! How can I help you today? Ask me anything about your courses, weak topics, or study plans.",
      time: "Just now",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!progressKey) {
      setProgressLoaded(true);
      return;
    }

    setProgressLoaded(false);
    setActiveMenu("overview");
    setEffortLevel(isNewAccount ? 0 : 10);
    setRecommendationActions(isNewAccount ? [] : AI_RECOMMENDATION.actions);
    setStudyPlanGenerated(false);
    setMessages([
      {
        id: "msg-0",
        sender: "bot",
        text: isNewAccount
          ? "Welcome to CAMPUS-NEXUS. Your course data will appear here as your campus shares it."
          : "Hi Student! How can I help you today? Ask me anything about your courses, weak topics, or study plans.",
        time: "Just now",
      },
    ]);

    try {
      const saved = localStorage.getItem(progressKey);
      if (saved) {
        const progress = JSON.parse(saved) as {
          activeMenu?: string;
          effortLevel?: number;
          completedRecommendationIds?: string[];
          studyPlanGenerated?: boolean;
          messages?: CopilotMessage[];
        };
        if (typeof progress.activeMenu === "string") setActiveMenu(progress.activeMenu);
        if (typeof progress.effortLevel === "number") setEffortLevel(progress.effortLevel);
        if (typeof progress.studyPlanGenerated === "boolean") {
          setStudyPlanGenerated(progress.studyPlanGenerated);
        }
        if (Array.isArray(progress.completedRecommendationIds)) {
          setRecommendationActions((actions) =>
            actions.map((action) => ({
              ...action,
              completed: progress.completedRecommendationIds!.includes(action.id),
            }))
          );
        }
        if (Array.isArray(progress.messages)) setMessages(progress.messages);
      }
    } catch (error) {
      console.error("Could not restore saved student dashboard progress:", error);
    } finally {
      setProgressLoaded(true);
    }
  }, [progressKey, isNewAccount]);

  useEffect(() => {
    if (!user?.id) return;
    const tourKey = `nexus_student_tour_complete:${user.id}`;
    try {
      setTourOpen(isNewAccount && localStorage.getItem(tourKey) !== "true");
    } catch (error) {
      console.error("Could not read student tour status:", error);
      setTourOpen(isNewAccount);
    }
    setTourStep(0);
  }, [user?.id, isNewAccount]);

  useEffect(() => {
    if (!progressKey || !progressLoaded || isTyping) return;
    try {
      localStorage.setItem(
        progressKey,
        JSON.stringify({
          activeMenu,
          effortLevel,
          completedRecommendationIds: recommendationActions
            .filter((action) => action.completed)
            .map((action) => action.id),
          studyPlanGenerated,
          messages,
        })
      );
    } catch (error) {
      console.error("Could not save student dashboard progress:", error);
    }
  }, [
    activeMenu,
    effortLevel,
    isTyping,
    messages,
    progressKey,
    progressLoaded,
    recommendationActions,
    studyPlanGenerated,
  ]);

  const closeTour = useCallback(() => {
    if (user?.id) {
      try {
        localStorage.setItem(`nexus_student_tour_complete:${user.id}`, "true");
      } catch (error) {
        console.error("Could not save student tour status:", error);
      }
    }
    setTourOpen(false);
  }, [user?.id]);

  useEffect(() => {
    if (!tourOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeTour();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [closeTour, tourOpen]);

  useEffect(() => {
    chatScrollRef.current?.scrollTo({
      top: chatScrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isTyping]);

  const handleSendPrompt = (promptText: string) => {
    if (!promptText.trim()) return;

    const userMsg: CopilotMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: promptText,
      time: "Just now",
    };

    setMessages((prev) => [...prev, userMsg]);
    setChatInput("");
    setIsTyping(true);

    const matched = COPILOT_PRESETS.find(
      (p) => p.label.toLowerCase() === promptText.toLowerCase()
    );

    const botReply =
      matched?.reply ||
      `I've analyzed your question regarding "${promptText}". In your recent quiz on Computer Networks, your latency and distance-vector responses need a quick 10-minute brushup. Would you like me to schedule a targeted drill?`;

    setTimeout(() => {
      setIsTyping(false);
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-bot-${Date.now()}`,
          sender: "bot",
          text: botReply,
          time: "Just now",
        },
      ]);
    }, 700);
  };

  // 10 Navigation items in exact order specified:
  // 1. Overview, 2. My Academics, 3. Mastery Map, 4. Grade Predictor, 5. AI Study Planner,
  // 6. Micro Drills, 7. AI Copilot, 8. Grievance Centre, 9. Campus Life, 10. Settings
  const studentNavItems: NavItem[] = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "academics", label: "My Academics", icon: GraduationCap },
    { id: "learning", label: "Mastery Map", icon: Compass },
    { id: "grade-predictor", label: "Grade Predictor", icon: LineChartIcon },
    { id: "planner", label: "AI Study Planner", icon: CalendarDays },
    { id: "drills", label: "Micro Drills", icon: Brain },
    { id: "copilot", label: "AI Copilot", icon: Bot },
    { id: "privacy", label: "Grievance Centre", icon: ShieldAlert },
    { id: "community", label: "Campus Life", icon: Sparkles },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  // Donut Chart Data (72% Overall Mastery) in Mint & Border Tint
  const donutData = [
    { name: "Mastered", value: 72, fill: "#34D399" },
    { name: "Remaining", value: 28, fill: "#CDEBDD" },
  ];

  const handleNavClick = (id: string) => {
    setActiveMenu(id);
    if (onView && id !== "overview") {
      onView(id);
    } else {
      const section = document.getElementById("student-" + id);
      section?.scrollIntoView({block:"start"});
      section?.focus({preventScroll:true});
    }
  };

  return (
    <div
      className={`min-h-screen ${
        embedded ? "bg-transparent" : "bg-white"
      } text-[#0B2E22] flex flex-col font-sans selection:bg-[#34D399]/30`}
    >
      {/* Top Navigation Bar (replaces left sidebar) */}
      {!embedded && (
        <DashboardTopNavbar
          items={studentNavItems}
          activeId={activeMenu}
          onSelect={handleNavClick}
          user={user}
          onLogout={onLogout}
          roleBadgeText="Student"
          roleColor="#047857"
          tagline="Find why a student is failing. Then fix it."
        />
      )}

      {/* Main Content Workspace (full width, centered max-w-[1280px], 24px side padding) */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Hero Banner */}
        <div id="student-overview" tabIndex={-1} style={{scrollMarginTop:80}} className="relative rounded-xl bg-[#F0FAF5] border border-[#CDEBDD] p-6 sm:p-8 overflow-hidden shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2E22] flex items-center gap-2">
                <span>Good Morning, {user ? user.full_name?.split(" ")[0] : "Student"}!</span>
                <Sparkles className="w-5 h-5 text-[#EAB308]" />
              </h1>
              <p className="text-sm text-[#4B6B5E] font-medium">
                Track. Improve. Excel — with{" "}
                <span className="text-[#047857] font-bold">CAMPUS-NEXUS</span>
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#CDEBDD] text-xs font-semibold text-[#0B2E22] shadow-[0_1px_2px_rgba(11,46,34,0.06)] self-start md:self-auto">
              <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" />
              <span>You&apos;re on track! Keep going towards your goals.</span>
            </div>
          </div>
        </div>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 z-10">
        {!embedded && (
          <header className="h-16 px-4 sm:px-6 lg:px-8 border-b border-mint-400/15 bg-darkEmerald-950/70 backdrop-blur-xl flex items-center justify-between gap-4 sticky top-0 z-30">
            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-3.5 h-3.5 text-mint-400/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for anything... (marks, courses, queries)"
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-darkEmerald-900/70 border border-mint-400/25 rounded-full pl-9 pr-14 py-1.5 text-xs text-white placeholder:text-mint-accent/40 focus:outline-none focus:border-mint-accent focus:ring-1 focus:ring-mint-accent"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono font-bold text-mint-accent/60 bg-darkEmerald-800/80 px-1.5 py-0.5 rounded border border-mint-400/20">
                ⌘K
              </span>
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <button
                type="button"
                onClick={() => {
                  setTourStep(0);
                  setTourOpen(true);
                }}
                className="hidden rounded-lg border border-mint-400/25 px-3 py-2 text-xs font-semibold text-mint-accent transition-colors hover:border-mint-400/50 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-400 md:inline-flex"
              >
                Take Tour
              </button>
              {onBackToLanding ? (
                <button
                  onClick={onBackToLanding}
                  className="text-xs text-mint-accent/70 hover:text-white transition-colors hidden md:inline-flex items-center gap-1"
                >
                  <span>Public Showcase</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              ) : (
                <Link
                  href="/"
                  className="text-xs text-mint-accent/70 hover:text-white transition-colors hidden md:inline-flex items-center gap-1"
                >
                  <span>Public Showcase</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              )}

              <button
                aria-label={isNewAccount ? "No new notifications" : "3 new notifications"}
                onClick={() => onNotify?.(
                  isNewAccount
                    ? "No notifications yet. Your campus updates will appear here."
                    : "You have 3 notifications: Database Systems quiz graded, OS assignment due tomorrow, and a new study partner match!",
                  "info"
                )}
                className="relative p-2 rounded-full bg-darkEmerald-900/80 border border-mint-400/25 text-mint-accent hover:text-white transition-all shadow-sm"
              >
                <Bell className="w-4 h-4" />
                {!isNewAccount && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center ring-2 ring-darkEmerald-950 shadow-[0_0_8px_rgba(239,68,68,0.8)]">
                    3
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 pl-2 border-l border-mint-400/20">
                <div className="w-8 h-8 rounded-full bg-mint-400 text-darkEmerald-950 font-bold flex items-center justify-center text-xs shadow-[0_0_10px_rgba(74,222,154,0.5)]">
                  {user ? user.full_name?.slice(0, 2).toUpperCase() : "ST"}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold text-white flex items-center gap-1">
                    {user ? user.full_name.split(" ")[0] : "Student"} <ChevronDown className="w-3 h-3 text-mint-400/70" />
                  </span>
                  <span className="text-[10px] text-mint-accent/60 -mt-0.5">
                    {user ? `${user.department || "Computer Science"} (Sem ${user.semester || 5})` : "Computer Science (Sem 5)"}
                  </span>
                </div>
              </div>

              {onLogout && (
                <button
                  onClick={onLogout}
                  className="p-2 text-xs text-mint-accent/70 hover:text-white rounded-lg border border-mint-400/20 hover:border-mint-400/50 transition-colors ml-1"
                  title="Sign out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </header>
        )}

        {/* Dashboard Body Workspace */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl w-full mx-auto">
          {isNewAccount ? (
            <FreshStudentDashboard
              user={user}
              onStartTour={() => {
                setTourStep(0);
                setTourOpen(true);
              }}
            />
          ) : (
          <>
          {/* 4 KPI Cards with Sparklines */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {KPI_CARDS.map((kpi) => (
              <KpiCard
                key={kpi.id}
                item={kpi}
                onClick={() => {
                  if (kpi.id === "kpi-attendance" && onView) onView("attendance");
                  else if (kpi.id === "kpi-mastery" && onView) onView("learning");
                }}
              />
            ))}
          </div>

        {/* Main 2-Column Dashboard Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Center / Main Feed (cols 8) */}
          <div className="xl:col-span-8 space-y-6">
            {/* Row 1: Mastery Map Card + AI Study Recommendation Card */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 1. My Mastery Map */}
              <div id="student-learning" tabIndex={-1} style={{scrollMarginTop:80}} className="rounded-xl bg-[#F0FAF5] border border-[#CDEBDD] p-5 shadow-[0_1px_2px_rgba(11,46,34,0.06)] space-y-4">
                <div className="flex items-center justify-between border-b border-[#CDEBDD] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#34D399]/20 border border-[#34D399]/40 flex items-center justify-center text-[#047857]">
                      <Compass className="w-4 h-4" />
                    </div>
                    <h3 className="text-sm font-bold text-[#0B2E22]">My Mastery Map</h3>
                  </div>
                  {onView && (
                    <button
                      onClick={() => onView("learning")}
                      className="text-xs font-semibold text-[#047857] hover:text-[#065F46] cursor-pointer flex items-center gap-1"
                    >
                      View Details <ArrowRight className="w-3 h-3" />
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-4 py-2">
                  <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          dataKey="value"
                          innerRadius={33}
                          outerRadius={44}
                          startAngle={90}
                          endAngle={-270}
                          stroke="none"
                        >
                          {donutData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-lg font-black text-[#0B2E22] leading-none">72%</span>
                      <span className="text-[7.5px] font-bold uppercase tracking-wider text-[#047857] mt-0.5">
                        Mastered
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#0B2E22]">
                        Strong in DBMS & OS
                      </span>
                    </div>
                    <p className="text-[11px] text-[#4B6B5E] leading-relaxed">
                      Identified 2 prerequisite concept gaps in Computer Networks &
                      Dynamic Programming.
                    </p>
                    {onView && (
                      <button
                        onClick={() => onView("learning")}
                        className="text-[11px] font-semibold text-[#047857] hover:text-[#065F46] flex items-center gap-1 pt-1"
                      >
                        Open DKT Concept Graph <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#CDEBDD]">
                  {MASTERY_COURSES.map((course) => (
                    <ProgressBar
                      key={course.code}
                      label={course.name}
                      value={course.percentage}
                      color={course.color}
                      code={course.code}
                      instructor={course.instructor}
                    />
                  ))}
                </div>
              </div>

              {/* 2. AI Study Recommendation with Mascot Robot */}
              <div id="student-planner" tabIndex={-1} style={{scrollMarginTop:80}} className="rounded-xl bg-[#F0FAF5] border border-[#CDEBDD] p-5 shadow-[0_1px_2px_rgba(11,46,34,0.06)] space-y-4 flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3 border-b border-[#CDEBDD] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="relative w-9 h-9 rounded-xl bg-white border border-[#CDEBDD] p-1 flex items-center justify-center overflow-hidden">
                        <Image
                          src="/images/robot.svg"
                          alt="NEXUS AI Bot Mascot"
                          width={32}
                          height={32}
                          className="object-contain"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h3 className="text-sm font-bold text-[#0B2E22]">
                            AI Recommendation
                          </h3>
                          <span className="text-[9px] bg-[#FEF9C3] text-[#713F12] border border-[#FACC15] px-1.5 py-0.5 rounded-full font-bold">
                            High Priority
                          </span>
                        </div>
                        <span className="text-[10px] text-[#4B6B5E]">
                          Based on your recent quiz in {AI_RECOMMENDATION.topic}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl bg-white border border-[#CDEBDD] p-3 space-y-1.5">
                    <span className="text-xs font-bold text-[#047857]">
                      {AI_RECOMMENDATION.topic}
                    </span>
                    <p className="text-[11px] text-[#4B6B5E] leading-relaxed">
                      {AI_RECOMMENDATION.rationale}
                    </p>
                  </div>

                  <div className="space-y-2 pt-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#4B6B5E] block">
                      Recommended Next Steps:
                    </span>
                    {recommendationActions.map((action) => (
                      <div
                        key={action.id}
                        onClick={() => toggleAction(action.id)}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-white border border-[#CDEBDD] hover:border-[#34D399] cursor-pointer transition-colors"
                      >
                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border transition-colors ${
                            action.completed
                              ? "bg-[#34D399] border-[#34D399] text-[#0B2E22]"
                              : "border-[#CDEBDD] bg-white"
                          }`}
                        >
                          {action.completed && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span
                          className={`text-xs ${
                            action.completed
                              ? "line-through text-[#7A968A]"
                              : "text-[#0B2E22] font-medium"
                          }`}
                        >
                          {action.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setStudyPlanGenerated(true);
                      onNotify?.("Demo study schedule prepared.", "success");
                      if (onView) onView("planner");
                    }}
                    className="w-full py-2.5 text-xs font-bold flex items-center justify-center gap-2 rounded-xl transition-all bg-[#FACC15] text-[#0B2E22] hover:bg-[#EAB308] shadow-[0_1px_2px_rgba(11,46,34,0.06)]"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>
                      {studyPlanGenerated ? "✓ Plan Generated" : "Generate Study Plan"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Grade Time Machine (Interactive Effort Slider + Chart) */}
            <div id="student-grade-predictor" tabIndex={-1} style={{scrollMarginTop:80}} className="rounded-xl bg-[#F0FAF5] border border-[#CDEBDD] p-5 sm:p-6 shadow-[0_1px_2px_rgba(11,46,34,0.06)] space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#CDEBDD] pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-white border border-[#CDEBDD] flex items-center justify-center text-[#047857]">
                    <Sliders className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-[#0B2E22]">
                        Grade Time Machine
                      </h3>
                      <span className="text-[10px] bg-[#FEF9C3] text-[#713F12] border border-[#FACC15] px-2 py-0.5 rounded-full font-bold">
                        Predictive Model
                      </span>
                    </div>
                    <p className="text-xs text-[#4B6B5E]">
                      Simulate the impact of extra targeted study hours on your final grade.
                    </p>
                  </div>
                </div>

                <div className="px-3.5 py-1.5 rounded-xl bg-white border border-[#CDEBDD] text-[#0B2E22] text-xs font-bold self-start sm:self-auto shadow-sm">
                  {currentPrediction.gradeTransition}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-2">
                      <span className="text-[#4B6B5E]">
                        Extra Weekly Study Effort:
                      </span>
                      <span className="text-[#047857] text-sm font-extrabold">
                        +{effortLevel}% ({effortLevel / 5} hrs/wk)
                      </span>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="20"
                      step="5"
                      value={effortLevel}
                      onChange={(e) => setEffortLevel(Number(e.target.value))}
                      className="range-control w-full cursor-pointer accent-[#34D399]"
                    />

                    <div className="flex justify-between text-[10px] text-[#7A968A] font-bold mt-1 px-1">
                      <span>Current (0%)</span>
                      <span>+10% Effort</span>
                      <span>+20% Effort</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-white border border-[#CDEBDD] space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#047857] block">
                      Estimated Semester Outcome
                    </span>
                    <p className="text-xs text-[#0B2E22]">
                      At <strong className="text-[#047857]">+{effortLevel}% effort</strong>,
                      your projected GPA moves from{" "}
                      <strong className="text-[#0B2E22]">3.4</strong> to{" "}
                      <strong className="text-[#047857]">
                        {(3.4 + (effortLevel / 20) * 0.4).toFixed(2)}
                      </strong>
                      .
                    </p>
                  </div>
                </div>

                <div className="lg:col-span-7 h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={currentPrediction.points}
                      margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                    >
                      <XAxis
                        dataKey="name"
                        tick={{ fontSize: 11, fill: "#4B6B5E" }}
                        axisLine={{ stroke: "#CDEBDD" }}
                        tickLine={false}
                      />
                      <YAxis
                        domain={[70, 95]}
                        tick={{ fontSize: 11, fill: "#4B6B5E" }}
                        axisLine={{ stroke: "#CDEBDD" }}
                        tickLine={false}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          borderColor: "#CDEBDD",
                          borderRadius: "10px",
                          fontSize: "11px",
                          color: "#0B2E22",
                          boxShadow: "0 4px 12px rgba(11,46,34,0.08)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="score"
                        stroke="#047857"
                        strokeWidth={3}
                        dot={{ fill: "#34D399", r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#34D399" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Row 3: Upcoming Activities List */}
            <div id="student-academics" tabIndex={-1} style={{scrollMarginTop:80}} className="rounded-xl bg-[#F0FAF5] border border-[#CDEBDD] p-5 shadow-[0_1px_2px_rgba(11,46,34,0.06)] space-y-4">
              <div className="flex items-center justify-between border-b border-[#CDEBDD] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white border border-[#CDEBDD] flex items-center justify-center text-[#047857]">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-[#0B2E22]">Upcoming Activities</h3>
                </div>
                {onView && (
                  <button
                    onClick={() => onView("planner")}
                    className="text-xs font-semibold text-[#047857] hover:text-[#065F46] flex items-center gap-1"
                  >
                    View Calendar <ArrowRight className="w-3 h-3" />
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {UPCOMING_ACTIVITIES.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-white border border-[#CDEBDD] hover:border-[#34D399] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F0FAF5] border border-[#CDEBDD] flex items-center justify-center text-[#047857]">
                        {act.type === "quiz" ? (
                          <Brain className="w-4 h-4 text-[#047857]" />
                        ) : act.type === "lab" ? (
                          <Sparkles className="w-4 h-4 text-[#047857]" />
                        ) : (
                          <CalendarDays className="w-4 h-4 text-[#047857]" />
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#0B2E22]">
                            {act.title}
                          </span>
                          <span className="text-[9px] bg-[#F0FAF5] text-[#4B6B5E] px-2 py-0.5 rounded border border-[#CDEBDD] font-bold">
                            {act.course}
                          </span>
                        </div>
                        <span className="text-[11px] text-[#4B6B5E]">
                          {act.due}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                        act.badge === "Urgent"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : act.badge === "Event"
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}
                    >
                      {act.badge}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (cols 4): Quick Access + Live NEXUS Copilot Chat */}
          <div className="xl:col-span-4 space-y-6">
            {/* Quick Access Tiles */}
            <div className="rounded-xl bg-[#F0FAF5] border border-[#CDEBDD] p-5 shadow-[0_1px_2px_rgba(11,46,34,0.06)] space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#4B6B5E] border-b border-[#CDEBDD] pb-2.5">
                Quick Access
              </h3>

              <div className="grid grid-cols-2 gap-2.5">
                {QUICK_ACCESS_ITEMS.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      const dest: Record<string,string> = {"qa-drills":"drills","qa-planner":"planner","qa-grievance":"privacy","qa-matcher":"community"};
                      handleNavClick(dest[item.id]);
                    }}
                    className="p-3 rounded-xl bg-white border border-[#CDEBDD] hover:border-[#34D399] hover:bg-[#F0FAF5] transition-all text-left group"
                  >
                    <div className="w-7 h-7 rounded-lg bg-[#F0FAF5] border border-[#CDEBDD] flex items-center justify-center text-[#047857] mb-2 group-hover:scale-110 transition-transform">
                      {item.icon === "Brain" ? (
                        <Brain className="w-3.5 h-3.5" />
                      ) : item.icon === "CalendarDays" ? (
                        <CalendarDays className="w-3.5 h-3.5" />
                      ) : item.icon === "Shield" ? (
                        <Shield className="w-3.5 h-3.5" />
                      ) : (
                        <Sparkles className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#0B2E22] block group-hover:text-[#047857] transition-colors">
                      {item.label}
                    </span>
                    <span className="text-[10px] text-[#4B6B5E] line-clamp-1">
                      {item.desc}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* NEXUS AI Copilot Chat Drawer */}
            <div id="student-copilot" tabIndex={-1} style={{scrollMarginTop:80}} className="rounded-xl bg-[#F0FAF5] border border-[#CDEBDD] shadow-[0_1px_2px_rgba(11,46,34,0.06)] overflow-hidden flex flex-col h-[460px]">
              {/* Copilot Header */}
              <div className="p-4 border-b border-[#CDEBDD] bg-white flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full bg-[#F0FAF5] border border-[#CDEBDD] p-0.5 flex items-center justify-center">
                    <Image
                      src="/images/robot.svg"
                      alt="Bot"
                      width={24}
                      height={24}
                      className="object-contain"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-[#34D399] ring-1 ring-white" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#0B2E22] flex items-center gap-1.5">
                      NEXUS AI Copilot
                      <span className="text-[9px] bg-[#FEF9C3] text-[#713F12] border border-[#FACC15] px-1.5 py-0.2 rounded-full font-bold">
                        Online
                      </span>
                    </h4>
                    <span className="text-[10px] text-[#4B6B5E]">
                      Ask questions about your courses & weak topics
                    </span>
                  </div>
                </div>
              </div>

              {/* Messages Body */}
              <div
                ref={chatScrollRef}
                className="flex-1 p-4 overflow-y-auto space-y-3 text-xs bg-[#F0FAF5]"
              >
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.sender === "user" ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 leading-relaxed ${
                        m.sender === "user"
                          ? "bg-[#34D399] text-[#0B2E22] font-medium rounded-tr-none shadow-sm"
                          : "bg-white text-[#0B2E22] border border-[#CDEBDD] rounded-tl-none shadow-sm"
                      }`}
                    >
                      {m.text}
                    </div>
                    <span className="text-[9px] text-[#7A968A] mt-1 px-1">
                      {m.time}
                    </span>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex items-center gap-1.5 text-[11px] text-[#047857] bg-white px-3 py-1.5 rounded-full w-fit border border-[#CDEBDD]">
                    <Sparkles className="w-3 h-3 animate-spin text-[#EAB308]" />
                    <span>NEXUS is thinking...</span>
                  </div>
                )}
              </div>

              {/* Quick Presets Pills */}
              <div className="px-3 py-2 bg-white border-t border-[#CDEBDD] flex gap-1.5 overflow-x-auto no-scrollbar">
                {COPILOT_PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendPrompt(p.label)}
                    className="text-[10px] whitespace-nowrap bg-[#F0FAF5] hover:bg-[#FEF9C3] text-[#0B2E22] border border-[#CDEBDD] hover:border-[#FACC15] px-2.5 py-1 rounded-full transition-all flex-shrink-0"
                  >
                    {p.label}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-white border-t border-[#CDEBDD] flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Ask NEXUS AI anything..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendPrompt(chatInput)}
                  className="flex-1 bg-white border border-[#CDEBDD] rounded-full px-4 py-2 text-xs text-[#0B2E22] placeholder-[#7A968A] focus:outline-none focus:border-[#34D399] focus:ring-2 focus:ring-[#34D399]/30"
                />
                <button
                  onClick={() => handleSendPrompt(chatInput)}
                  className="w-8 h-8 rounded-full bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] flex items-center justify-center transition-all shadow-sm flex-shrink-0"
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
          </>
          )}
        </div>
      </div>
        <div className="nx nx-grid">
          {([["drills","Micro Drills","m15","Practise a recall prompt"],["privacy","Grievance Centre","m02","Inspect the confidential reporting workflow"],["community","Campus Life","m04","Explore peer matching"]] as const).map(([id,title,module,label])=><section className="nx-card" id={"student-"+id} key={id} tabIndex={-1} style={{scrollMarginTop:80}}><small>DEMO</small><h2>{title}</h2><Link href={"/modules/"+module}>{label} →</Link>{id==="community"&&<p><Link href="/modules/m14">Campus notices →</Link></p>}</section>)}
          <section id="student-settings" className="nx-card" tabIndex={-1} style={{scrollMarginTop:80}}><h2>Settings</h2><p>Display theme on this device</p><ThemeToggle/></section>
        </div>
      </main>
      {tourOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeTour();
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="student-tour-title"
            aria-describedby="student-tour-description"
            className="w-full max-w-lg rounded-2xl border border-mint-400/35 bg-darkEmerald-950 p-5 shadow-2xl sm:p-7"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="text-xs font-semibold text-mint-300">Dashboard Tour · {tourStep + 1} of {STUDENT_TOUR_STEPS.length}</p>
                <h2 id="student-tour-title" className="mt-2 text-xl font-bold text-white [text-wrap:balance]">
                  {STUDENT_TOUR_STEPS[tourStep].title}
                </h2>
              </div>
              <button
                type="button"
                onClick={closeTour}
                aria-label="Close tour"
                className="shrink-0 rounded-lg p-2 text-mint-accent hover:bg-darkEmerald-900 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint-400"
              >
                <X className="h-5 w-5" aria-hidden="true" />
              </button>
            </div>
            <p id="student-tour-description" aria-live="polite" className="mt-4 text-sm leading-relaxed text-mint-accent/80">
              {STUDENT_TOUR_STEPS[tourStep].description}
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={closeTour}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-mint-accent/75 hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint-400"
              >
                Skip Tour
              </button>
              <div className="flex items-center gap-2">
                {tourStep > 0 && (
                  <button
                    type="button"
                    onClick={() => setTourStep((step) => Math.max(0, step - 1))}
                    className="rounded-lg border border-mint-400/25 px-3 py-2 text-xs font-semibold text-mint-200 hover:bg-darkEmerald-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-mint-400"
                  >
                    Back
                  </button>
                )}
                {tourStep < STUDENT_TOUR_STEPS.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setTourStep((step) => Math.min(STUDENT_TOUR_STEPS.length - 1, step + 1))}
                    className="rounded-lg bg-mint-400 px-4 py-2 text-xs font-bold text-darkEmerald-950 hover:bg-mint-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-300"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={closeTour}
                    className="rounded-lg bg-mint-400 px-4 py-2 text-xs font-bold text-darkEmerald-950 hover:bg-mint-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-mint-300"
                  >
                    Finish Tour
                  </button>
                )}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
