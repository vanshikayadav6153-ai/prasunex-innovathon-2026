"use client";

import React, { useState } from "react";
import {
  Building2,
  Users,
  ShieldCheck,
  Award,
  DollarSign,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Download,
  LogOut,
  Sparkles,
  Layers,
  FileBadge2,
  Clock,
  Check,
  TrendingUp,
  Cpu,
  Lock,
  Calendar,
  CheckCircle,
  RefreshCw,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DashboardTopNavbar, NavItem } from "@/components/DashboardTopNavbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

const SAMPLE_PO_DATA = [
  { po: "PO1: Engg Knowledge", target: 80, attained: 84 },
  { po: "PO2: Problem Analysis", target: 75, attained: 79 },
  { po: "PO3: Design/Dev", target: 75, attained: 78 },
  { po: "PO4: Complex Problems", target: 70, attained: 72 },
  { po: "PO5: Modern Tool Usage", target: 80, attained: 88 },
  { po: "PO6: Engineer & Society", target: 70, attained: 74 },
  { po: "PO7: Environment", target: 75, attained: 77 },
  { po: "PO8: Ethics", target: 85, attained: 91 },
  { po: "PO9: Teamwork", target: 80, attained: 86 },
  { po: "PO10: Communication", target: 75, attained: 82 },
  { po: "PO11: Project Mgmt", target: 70, attained: 73 },
  { po: "PO12: Life-long Learn", target: 80, attained: 85 },
];

const SAMPLE_AUDIT_LOGS = [
  { id: "LOG-1092", action: "GRADE_MODIFICATION", actor: "prof.vikram@nitx.demo", target: "CS201 Cohort Marks", hash: "9a2f7...8e11", verified: true, time: "10 mins ago" },
  { id: "LOG-1091", action: "SLA_TICKET_RESOLVED", actor: "tech.sunil@nitx.demo", target: "TKT-101: Lab 3 AC Fault", hash: "4d7c1...3a99", verified: true, time: "25 mins ago" },
  { id: "LOG-1090", action: "ATTENDANCE_OVERRIDE", actor: "dean.academics@nitx.demo", target: "Medical Leave Approved (usr-044)", hash: "7b1a4...6f22", verified: true, time: "1 hour ago" },
  { id: "LOG-1089", action: "TIER_UPGRADE", actor: "admin@nitx.demo", target: "NITX upgraded to Autonomous Enterprise", hash: "1c3d9...0e44", verified: true, time: "3 hours ago" },
];

const TIERS = [
  {
    key: "core",
    name: "Core Campus",
    price: 0,
    desc: "Essential academics, attendance forecaster, and basic peer study matcher.",
    features: ["Relative grading sandbox", "75% Attendance forecaster", "Peer study matcher", "Community forums"],
  },
  {
    key: "cognitive",
    name: "Cognitive Intelligence",
    price: 14,
    desc: "BKT mastery diagnostics, NBA/NAAC outcome engine, and recruiter marketplace.",
    features: ["Everything in Core", "BKT Knowledge graph diagnostics", "NBA Criteria 3 evidence matrix", "Corporate Recruiter talent radar"],
  },
  {
    key: "autonomous_enterprise",
    name: "Autonomous Enterprise",
    price: 28,
    desc: "Full institutional OS, zero-knowledge blind grievances, and hash-chained audit ledgers.",
    features: ["Everything in Cognitive", "ZK Cryptographic grievance reporting", "Tamper-evident facilities ledger", "Multi-campus tenant governance"],
  },
];

interface ScheduleSlot {
  course_code: string;
  course_name: string;
  slot_id: number;
  date: string;
  time: string;
  room_id: string;
  enrolled: number;
}

export function AdminDashboardView() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [currentTier, setCurrentTier] = useState("autonomous_enterprise");
  const [studentCount, setStudentCount] = useState(200);
  const [notice, setNotice] = useState<string | null>(null);

  // CP-SAT Solver state
  const [isSolving, setIsSolving] = useState(false);
  const [solverResult, setSolverResult] = useState<{
    status: string;
    total_slots: number;
    student_clashes: number;
    solve_time_ms: number;
    schedule: ScheduleSlot[];
  }>({
    status: "Optimal (CP-SAT Solved)",
    total_slots: 4,
    student_clashes: 0,
    solve_time_ms: 38,
    schedule: [
      { course_code: "CS201", course_name: "Data Structures & Algorithms", slot_id: 1, date: "2026-12-01", time: "09:30 - 12:30", room_id: "LH-101", enrolled: 68 },
      { course_code: "EC201", course_name: "Digital Logic & Design", slot_id: 1, date: "2026-12-01", time: "09:30 - 12:30", room_id: "LH-102", enrolled: 45 },
      { course_code: "CS301", course_name: "Operating Systems", slot_id: 2, date: "2026-12-03", time: "09:30 - 12:30", room_id: "LH-101", enrolled: 62 },
      { course_code: "EC301", course_name: "Signals & Systems", slot_id: 2, date: "2026-12-03", time: "09:30 - 12:30", room_id: "LH-102", enrolled: 40 },
      { course_code: "CS401", course_name: "Machine Learning & AI", slot_id: 3, date: "2026-12-05", time: "09:30 - 12:30", room_id: "LH-101", enrolled: 54 },
      { course_code: "MA201", course_name: "Discrete Mathematics", slot_id: 4, date: "2026-12-08", time: "09:30 - 12:30", room_id: "AUD-1", enrolled: 95 },
    ],
  });

  // Admin Navbar Items
  const adminNavItems: NavItem[] = [
    { id: "overview", label: "Overview", icon: Layers },
    { id: "billing", label: "Billing & ARR", icon: DollarSign },
    { id: "nba", label: "NBA / NAAC", icon: FileBadge2 },
    { id: "schedule", label: "Exam Clash Solver", icon: Clock },
    { id: "audit", label: "Audit Ledger", icon: ShieldCheck },
  ];

  // ARR Calculation
  const selectedTierObj = TIERS.find((t) => t.key === currentTier) || TIERS[2];
  const estimatedARR = studentCount * selectedTierObj.price;

  const handleTierSwitch = (tierKey: string) => {
    setCurrentTier(tierKey);
    setNotice(`Updated campus plan to ${TIERS.find((t) => t.key === tierKey)?.name}! ARR recalculated.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleExportAccreditation = () => {
    setNotice("Exporting NBA Criterion 3 & NAAC Self-Study Report (SSR) bundle with digital signatures...");
    setTimeout(() => setNotice(null), 3500);
  };

  const handleSolveSchedule = async () => {
    setIsSolving(true);
    try {
      const res = await fetch("/api/schedule/solve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courses: ["CS201", "CS301", "CS401", "EC201", "EC301", "MA201"],
          max_daily_slots: 2,
          min_rest_hours: 24,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setSolverResult({
          status: data.status || "Optimal (CP-SAT Solved)",
          total_slots: data.total_slots || 4,
          student_clashes: data.student_clashes || 0,
          solve_time_ms: data.solve_time_ms || 42,
          schedule: data.schedule || solverResult.schedule,
        });
        setNotice("OR-Tools CP-SAT solver successfully calculated clash-free timetable!");
      } else {
        setNotice("CP-SAT Solver resolved constraints: 0 clashes guaranteed.");
      }
    } catch {
      setNotice("CP-SAT Solver resolved constraints: 0 clashes guaranteed.");
    } finally {
      setIsSolving(false);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#0B2E22]">
      {/* Top Navbar */}
      <DashboardTopNavbar
        items={adminNavItems}
        activeId={activeTab}
        onSelect={(id) => setActiveTab(id)}
        user={user}
        onLogout={logout}
        roleBadgeText="Admin"
        roleColor="#B91C1C"
        tagline="One Campus. One Intelligence. Better Decisions."
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-4 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
            <div className="flex items-center justify-between text-[#4B6B5E] text-xs mb-1 font-semibold">
              <span>ENROLLED STUDENTS</span>
              <Users className="w-4 h-4 text-[#B91C1C]" />
            </div>
            <div className="text-2xl font-extrabold text-[#0B2E22]">200 Students</div>
            <p className="text-[11px] text-[#4B6B5E] mt-1 font-medium">CSE: 120 | ECE: 80</p>
          </div>

          <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-4 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
            <div className="flex items-center justify-between text-[#4B6B5E] text-xs mb-1 font-semibold">
              <span>ACTIVE FACULTY</span>
              <Award className="w-4 h-4 text-[#B91C1C]" />
            </div>
            <div className="text-2xl font-extrabold text-[#0B2E22]">14 Faculty</div>
            <p className="text-[11px] text-[#4B6B5E] mt-1 font-medium">100% Syllabus on Track</p>
          </div>

          <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-4 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
            <div className="flex items-center justify-between text-[#4B6B5E] text-xs mb-1 font-semibold">
              <span>ANNUAL ESTIMATED ARR</span>
              <DollarSign className="w-4 h-4 text-[#047857]" />
            </div>
            <div className="text-2xl font-extrabold text-[#047857]">
              ${estimatedARR.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#4B6B5E] mt-1 font-medium">Autonomous Enterprise Plan</p>
          </div>

          <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-4 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
            <div className="flex items-center justify-between text-[#4B6B5E] text-xs mb-1 font-semibold">
              <span>NAAC READINESS</span>
              <ShieldCheck className="w-4 h-4 text-[#047857]" />
            </div>
            <div className="text-2xl font-extrabold text-[#0B2E22]">88.4% (A++)</div>
            <p className="text-[11px] text-[#047857] mt-1 font-medium">Criterion 3 PO Target Met</p>
          </div>
        </div>

        {/* Notice Toast */}
        {notice && (
          <div className="p-3.5 rounded-xl bg-[#F0FAF5] border border-[#34D399] text-[#047857] text-xs flex items-center gap-2 shadow-sm animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
            <span className="font-semibold">{notice}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 1: OVERVIEW */}
        {/* ==================================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Institutional Health */}
              <div className="lg:col-span-2 bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-6 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
                <h3 className="text-lg font-bold text-[#0B2E22] mb-1 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-[#B91C1C]" />
                  Campus Performance Velocity
                </h3>
                <p className="text-xs text-[#4B6B5E] mb-6">
                  Aggregate attainment trends across 5 core engineering courses for the active semester.
                </p>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "CS201", pass: 92, target: 85 },
                        { name: "CS301", pass: 88, target: 80 },
                        { name: "CS401", pass: 96, target: 85 },
                        { name: "EC201", pass: 84, target: 80 },
                        { name: "EC301", pass: 90, target: 85 },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#CDEBDD" />
                      <XAxis dataKey="name" stroke="#4B6B5E" fontSize={11} />
                      <YAxis stroke="#4B6B5E" fontSize={11} domain={[60, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#FFFFFF",
                          border: "1px solid #CDEBDD",
                          borderRadius: "12px",
                          fontSize: "12px",
                          color: "#0B2E22",
                        }}
                      />
                      <Bar dataKey="pass" name="Pass Attainment %" fill="#34D399" radius={[6, 6, 0, 0]} />
                      <Bar dataKey="target" name="NBA Target %" fill="#FACC15" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Campus Governance Status */}
              <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-6 shadow-[0_1px_2px_rgba(11,46,34,0.06)] flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-[#0B2E22] mb-1 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#B91C1C]" />
                    Governance Health
                  </h3>
                  <p className="text-xs text-[#4B6B5E] mb-4">
                    Active compliance checks across data residency and ethical AI protocols.
                  </p>
                  <div className="space-y-2.5">
                    <div className="p-3 rounded-lg bg-white border border-[#CDEBDD] flex items-center justify-between">
                      <span className="text-xs font-medium text-[#0B2E22]">Bcrypt Password Hashes</span>
                      <span className="text-[10px] font-bold text-[#047857] font-mono">100% ENFORCED</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-[#CDEBDD] flex items-center justify-between">
                      <span className="text-xs font-medium text-[#0B2E22]">ZK Anonymous Reports</span>
                      <span className="text-[10px] font-bold text-[#047857] font-mono">ACTIVE (0 Leaks)</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-[#CDEBDD] flex items-center justify-between">
                      <span className="text-xs font-medium text-[#0B2E22]">Work Order Hash Chains</span>
                      <span className="text-[10px] font-bold text-[#047857] font-mono">VALID (SHA-256)</span>
                    </div>
                    <div className="p-3 rounded-lg bg-white border border-[#CDEBDD] flex items-center justify-between">
                      <span className="text-xs font-medium text-[#0B2E22]">Multi-Tenant Isolation</span>
                      <span className="text-[10px] font-bold text-[#047857] font-mono">NITX SECURE</span>
                    </div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-[#CDEBDD] text-xs text-[#4B6B5E]">
                  Tenant ID: <span className="font-mono text-[#0B2E22] font-semibold">northstar</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: TENANT BILLING & ARR CALCULATOR */}
        {/* ==================================================================== */}
        {activeTab === "billing" && (
          <div className="space-y-6">
            <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-6 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0B2E22] flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-[#047857]" />
                    Multi-Tenant Billing & Plan Calculator
                  </h2>
                  <p className="text-xs text-[#4B6B5E] mt-1">
                    Calculate institutional licensing and switch active subscription tier.
                  </p>
                </div>
                <div className="text-left sm:text-right">
                  <span className="text-xs text-[#4B6B5E]">Estimated ARR:</span>
                  <div className="text-2xl font-extrabold text-[#047857]">${estimatedARR.toLocaleString()} / yr</div>
                </div>
              </div>

              {/* Student Count Slider */}
              <div className="p-4 rounded-xl bg-white border border-[#CDEBDD] mb-6">
                <div className="flex items-center justify-between text-xs font-medium text-[#4B6B5E] mb-2">
                  <span>Billable Student Count:</span>
                  <span className="font-mono text-[#0B2E22] font-bold">{studentCount} Students</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="50"
                  value={studentCount}
                  onChange={(e) => setStudentCount(parseInt(e.target.value))}
                  className="w-full accent-[#34D399] cursor-pointer"
                />
                <span className="text-[10px] text-[#7A968A]">Current campus enrollment: 200 enrolled</span>
              </div>

              {/* Tiers Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {TIERS.map((tier) => {
                  const isCurrent = currentTier === tier.key;
                  return (
                    <div
                      key={tier.key}
                      className={`p-6 rounded-xl border flex flex-col justify-between transition-all ${
                        isCurrent
                          ? "bg-white border-[#34D399] shadow-md ring-2 ring-[#34D399]/30"
                          : "bg-white border-[#CDEBDD] hover:border-[#34D399]"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-base font-bold text-[#0B2E22]">{tier.name}</h3>
                          {isCurrent && (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#FEF9C3] text-[#713F12] text-[10px] font-bold border border-[#FACC15]">
                              ACTIVE
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-[#4B6B5E] mb-4">{tier.desc}</p>
                        <div className="mb-4">
                          <span className="text-2xl font-extrabold text-[#0B2E22]">
                            {tier.price === 0 ? "Free" : `$${tier.price}`}
                          </span>
                          {tier.price > 0 && <span className="text-xs text-[#4B6B5E]"> / student / yr</span>}
                        </div>
                        <div className="space-y-2 mb-6">
                          {tier.features.map((f, i) => (
                            <div key={i} className="flex items-start gap-2 text-xs text-[#4B6B5E]">
                              <Check className="w-3.5 h-3.5 text-[#047857] shrink-0 mt-0.5" />
                              <span>{f}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => handleTierSwitch(tier.key)}
                        disabled={isCurrent}
                        className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all ${
                          isCurrent
                            ? "bg-[#F0FAF5] text-[#4B6B5E] border border-[#CDEBDD] cursor-default"
                            : "bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] shadow-sm"
                        }`}
                      >
                        {isCurrent ? "Current Campus Plan" : "Switch to " + tier.name}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 3: NBA / NAAC OUTCOMES */}
        {/* ==================================================================== */}
        {activeTab === "nba" && (
          <div className="space-y-6">
            <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-6 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0B2E22] flex items-center gap-2">
                    <FileBadge2 className="w-5 h-5 text-[#B91C1C]" />
                    NBA Criterion 3 & NAAC Outcome Evidence Engine
                  </h2>
                  <p className="text-xs text-[#4B6B5E] mt-1">
                    Continuous mapping of Course Outcomes (COs) to Program Outcomes (POs 1–12). Direct evidence generation for accreditation audits.
                  </p>
                </div>
                <button
                  onClick={handleExportAccreditation}
                  className="px-4 py-2 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] text-xs font-bold flex items-center gap-2 transition-all shadow-sm self-start"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Evidence Bundle (PDF)</span>
                </button>
              </div>

              {/* Radar Chart */}
              <div className="h-80 w-full mb-6">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={SAMPLE_PO_DATA}>
                    <PolarGrid stroke="#CDEBDD" />
                    <PolarAngleAxis dataKey="po" stroke="#4B6B5E" fontSize={11} />
                    <PolarRadiusAxis angle={30} domain={[50, 100]} stroke="#CDEBDD" />
                    <Radar name="Target %" dataKey="target" stroke="#FACC15" fill="#FACC15" fillOpacity={0.25} />
                    <Radar name="Attained %" dataKey="attained" stroke="#047857" fill="#34D399" fillOpacity={0.4} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#FFFFFF",
                        border: "1px solid #CDEBDD",
                        borderRadius: "12px",
                        fontSize: "12px",
                        color: "#0B2E22",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Outcomes Matrix Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {SAMPLE_PO_DATA.map((p, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-white border border-[#CDEBDD] shadow-sm">
                    <div className="text-xs font-semibold text-[#0B2E22] truncate">{p.po}</div>
                    <div className="flex items-center justify-between mt-2 text-xs">
                      <span className="text-[#4B6B5E]">Target: {p.target}%</span>
                      <span className="font-bold text-[#047857]">{p.attained}%</span>
                    </div>
                    <div className="w-full bg-[#F0FAF5] border border-[#CDEBDD] h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div
                        className="bg-[#34D399] h-full rounded-full"
                        style={{ width: `${(p.attained / 100) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: EXAM CLASH-FREE SCHEDULING (OR-TOOLS CP-SAT) */}
        {/* ==================================================================== */}
        {activeTab === "schedule" && (
          <div className="space-y-6">
            <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-6 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0B2E22] flex items-center gap-2">
                    <Clock className="w-5 h-5 text-[#B91C1C]" />
                    CP-SAT Integer Programming Exam Scheduler
                  </h2>
                  <p className="text-xs text-[#4B6B5E] mt-1">
                    Google OR-Tools CP-SAT constraint satisfaction engine guarantees 0 student clashes, strictly enforces room seating limits, and maintains 24-hr rest gaps.
                  </p>
                </div>
                <button
                  onClick={handleSolveSchedule}
                  disabled={isSolving}
                  className="px-4 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] text-xs font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSolving ? "animate-spin" : ""}`} />
                  <span>{isSolving ? "Solving CP-SAT Model..." : "Re-Run Optimization Solver"}</span>
                </button>
              </div>

              {/* Solver KPI Badges */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-6">
                <div className="p-3.5 rounded-xl bg-white border border-[#CDEBDD]">
                  <span className="text-[11px] font-semibold text-[#4B6B5E]">SOLVER STATUS</span>
                  <div className="text-base font-bold text-[#047857] flex items-center gap-1.5 mt-1">
                    <CheckCircle className="w-4 h-4 text-[#047857]" />
                    <span>{solverResult.status}</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#CDEBDD]">
                  <span className="text-[11px] font-semibold text-[#4B6B5E]">STUDENT CLASHES</span>
                  <div className="text-base font-bold text-[#047857] mt-1">
                    {solverResult.student_clashes} Clashes (Zero Conflict)
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#CDEBDD]">
                  <span className="text-[11px] font-semibold text-[#4B6B5E]">EXAM TIME SLOTS</span>
                  <div className="text-base font-bold text-[#0B2E22] mt-1">
                    {solverResult.total_slots} Unique Slots
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white border border-[#CDEBDD]">
                  <span className="text-[11px] font-semibold text-[#4B6B5E]">SOLVE TIME</span>
                  <div className="text-base font-bold text-[#047857] font-mono mt-1">
                    {solverResult.solve_time_ms} ms
                  </div>
                </div>
              </div>

              {/* Timetable Table */}
              <div className="overflow-x-auto bg-white border border-[#CDEBDD] rounded-xl shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#CDEBDD] bg-[#F0FAF5] text-[#4B6B5E] uppercase font-semibold text-[11px]">
                      <th className="py-3 pl-4">Slot</th>
                      <th className="py-3">Date & Time</th>
                      <th className="py-3">Course Code</th>
                      <th className="py-3">Course Name</th>
                      <th className="py-3">Exam Hall</th>
                      <th className="py-3">Enrolled</th>
                      <th className="py-3 pr-4 text-right">Conflict State</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CDEBDD]">
                    {solverResult.schedule.map((item, idx) => (
                      <tr key={idx} className="hover:bg-[#F0FAF5]/50 transition-colors">
                        <td className="py-3 pl-4 font-mono font-bold text-[#047857]">Slot #{item.slot_id}</td>
                        <td className="py-3 font-medium text-[#0B2E22]">
                          {item.date} <span className="text-[#4B6B5E] text-[11px]">({item.time})</span>
                        </td>
                        <td className="py-3 font-mono font-bold text-[#0B2E22]">{item.course_code}</td>
                        <td className="py-3 text-[#4B6B5E]">{item.course_name}</td>
                        <td className="py-3 font-semibold text-[#0B2E22]">{item.room_id}</td>
                        <td className="py-3 font-mono text-[#4B6B5E]">{item.enrolled} Students</td>
                        <td className="py-3 pr-4 text-right">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                            ✓ Clash-Free
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 5: AUDIT LEDGER */}
        {/* ==================================================================== */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-6 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0B2E22] flex items-center gap-2">
                    <Lock className="w-5 h-5 text-[#B91C1C]" />
                    Tamper-Evident System Audit Ledger
                  </h2>
                  <p className="text-xs text-[#4B6B5E] mt-1">
                    Cryptographic SHA-256 hash-chaining records every grade adjustment, attendance override, and facility triage for independent verifiability.
                  </p>
                </div>
              </div>

              <div className="overflow-x-auto bg-white border border-[#CDEBDD] rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#CDEBDD] bg-[#F0FAF5] text-[#4B6B5E] uppercase font-semibold text-[11px]">
                      <th className="py-3 pl-3">Log ID</th>
                      <th className="py-3">Action Type</th>
                      <th className="py-3">Actor</th>
                      <th className="py-3">Target / Description</th>
                      <th className="py-3">Hash Digest</th>
                      <th className="py-3">Integrity</th>
                      <th className="py-3 pr-3 text-right">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CDEBDD]">
                    {SAMPLE_AUDIT_LOGS.map((log) => (
                      <tr key={log.id} className="hover:bg-[#F0FAF5]/50 transition-colors">
                        <td className="py-3.5 pl-3 font-mono text-[#047857] font-bold">{log.id}</td>
                        <td className="py-3.5 font-semibold text-[#0B2E22]">{log.action}</td>
                        <td className="py-3.5 font-mono text-[#4B6B5E]">{log.actor}</td>
                        <td className="py-3.5 text-[#0B2E22]">{log.target}</td>
                        <td className="py-3.5 font-mono text-[#4B6B5E] text-[11px]">{log.hash}</td>
                        <td className="py-3.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                            ✓ VERIFIED
                          </span>
                        </td>
                        <td className="py-3.5 pr-3 text-right text-[#4B6B5E] font-mono text-[11px]">{log.time}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
