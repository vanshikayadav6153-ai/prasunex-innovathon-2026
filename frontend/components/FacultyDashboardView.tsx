"use client";

import React, { useState, useMemo } from "react";
import {
  BookOpenCheck,
  Users,
  BarChart3,
  Activity,
  Award,
  AlertTriangle,
  Download,
  Sliders,
  CheckCircle2,
  Calendar,
  Layers,
  Brain,
  Sparkles,
  Camera,
  Filter,
  Check,
  TrendingUp,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { FreshRoleDashboard } from "@/components/FreshRoleDashboard";
import { DashboardTopNavbar, NavItem } from "@/components/DashboardTopNavbar";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const SAMPLE_COURSES = [
  { id: "cs201", code: "CS201", title: "Data Structures & Algorithms", enrolled: 68, avgScore: 78.4, passRate: 92 },
  { id: "cs301", code: "CS301", title: "Operating Systems", enrolled: 62, avgScore: 72.1, passRate: 88 },
  { id: "cs401", code: "CS401", title: "Machine Learning & AI", enrolled: 54, avgScore: 81.6, passRate: 96 },
];

const SAMPLE_AT_RISK_STUDENTS = [
  { id: "usr-012", name: "Rohan Patel", roll: "21CS044", course: "CS201", attendance: 68.2, predicted: 71.4, testScore: 48, status: "Critical", recommended: "Issue Attendance Warning & Remedial Lab" },
  { id: "usr-045", name: "Simran Kaur", roll: "21CS089", course: "CS301", attendance: 71.5, predicted: 73.8, testScore: 54, status: "Warning", recommended: "Assign Peer Study Partner" },
  { id: "usr-078", name: "Aditya Verma", roll: "21CS112", course: "CS201", attendance: 64.0, predicted: 68.0, testScore: 42, status: "Critical", recommended: "Parent Notice & HoD Counseling" },
  { id: "usr-092", name: "Neha Joshi", roll: "21CS135", course: "CS401", attendance: 73.0, predicted: 74.5, testScore: 61, status: "Warning", recommended: "Provide Micro-Drill Modules" },
];

const SAMPLE_QUESTION_AUDIT = [
  { id: "Q1", topic: "Red-Black Trees Deletion", difficulty: 0.82, discrimination: 0.44, bloom: "Apply", status: "Optimal (Good)", mastery: "64%" },
  { id: "Q2", topic: "Virtual Memory Paging", difficulty: 0.65, discrimination: 0.51, bloom: "Understand", status: "Optimal", mastery: "72%" },
  { id: "Q3", topic: "Backpropagation Math", difficulty: 0.89, discrimination: 0.38, bloom: "Analyze", status: "High Rigor", mastery: "48%" },
  { id: "Q4", topic: "Dijkstra Shortest Path", difficulty: 0.42, discrimination: 0.49, bloom: "Apply", status: "Optimal", mastery: "85%" },
  { id: "Q5", topic: "Thread Deadlock Detection", difficulty: 0.74, discrimination: 0.46, bloom: "Evaluate", status: "Optimal", mastery: "61%" },
  { id: "Q6", topic: "Read-Committed Isolation Serialization", difficulty: 0.94, discrimination: -0.24, bloom: "Apply", status: "DEFECT (Negative r_pbis)", mastery: "22%" },
];

export function FacultyDashboardView() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"grading" | "attendance" | "audit" | "overview">("grading");
  const [selectedCourse, setSelectedCourse] = useState("cs201");
  const [meanShift, setMeanShift] = useState(0);
  const [stdScale, setStdScale] = useState(1);
  const [gapAwareActive, setGapAwareActive] = useState(false);
  const [photoOcrModal, setPhotoOcrModal] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  // Faculty Navbar Items
  const facultyNavItems: NavItem[] = [
    { id: "grading", label: "Grading Sandbox", icon: BookOpenCheck },
    { id: "attendance", label: "At-Risk Forecaster", icon: Activity },
    { id: "audit", label: "Item Analysis & NBA", icon: Award },
    { id: "overview", label: "Department Overview", icon: BarChart3 },
  ];

  // Compute Gaussian Grade Distribution based on meanShift & stdScale
  const gradeDistribution = useMemo(() => {
    const baseGrades = [
      { grade: "O (90+)", count: 8 },
      { grade: "A+ (80-89)", count: 18 },
      { grade: "A (70-79)", count: 24 },
      { grade: "B+ (60-69)", count: 12 },
      { grade: "B (50-59)", count: 5 },
      { grade: "C (40-49)", count: 1 },
      { grade: "F (<40)", count: 0 },
    ];

    return baseGrades.map((g, idx) => {
      let mod = g.count;
      if (gapAwareActive) {
        // Gap aware shifts 14 boundary-trapped students into higher grades
        if (idx === 1) mod += 6;
        if (idx === 2) mod += 5;
        if (idx === 3) mod += 3;
        if (idx === 4) mod = Math.max(1, mod - 4);
      } else {
        if (meanShift > 0 && idx < 3) mod += Math.round(meanShift * 1.5);
        if (meanShift < 0 && idx > 3) mod += Math.round(Math.abs(meanShift) * 1.2);
        if (stdScale > 1) {
          if (idx === 0 || idx === 6) mod += 2;
        }
      }
      return { ...g, adjusted: Math.max(0, mod) };
    });
  }, [meanShift, stdScale, gapAwareActive]);

  const handleExport = (type: "pdf" | "csv") => {
    setExportNotice(`Exported ${type.toUpperCase()} Grade Ledger with NBA Attainment Signature!`);
    setTimeout(() => setExportNotice(null), 3500);
  };

  if (user?.is_new_account) {
    return (
      <FreshRoleDashboard
        user={user}
        roleLabel="Faculty"
        metrics={["Active Courses", "Total Enrolled", "At-Risk Students", "CO-PO Attainment"]}
        onLogout={logout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#0B2E22] flex flex-col font-sans selection:bg-[#34D399]/30">
      {/* Top Navbar */}
      <DashboardTopNavbar
        items={facultyNavItems}
        activeId={activeTab}
        onSelect={(id) => setActiveTab(id as any)}
        user={user}
        onLogout={logout}
        roleBadgeText="Faculty"
        roleColor="#1D4ED8"
        tagline="Explain. Calibrate. Elevate academic outcomes."
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Course Banner & Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-4 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
            <div className="flex items-center justify-between text-[#4B6B5E] text-xs mb-1 font-semibold">
              <span>ACTIVE COURSES</span>
              <BookOpenCheck className="w-4 h-4 text-[#1D4ED8]" />
            </div>
            <div className="text-2xl font-extrabold text-[#0B2E22]">3 Courses</div>
            <p className="text-[11px] text-[#4B6B5E] mt-1 font-medium">CS201, CS301, CS401</p>
          </div>

          <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-4 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
            <div className="flex items-center justify-between text-[#4B6B5E] text-xs mb-1 font-semibold">
              <span>TOTAL ENROLLED</span>
              <Users className="w-4 h-4 text-[#1D4ED8]" />
            </div>
            <div className="text-2xl font-extrabold text-[#0B2E22]">184 Students</div>
            <p className="text-[11px] text-[#4B6B5E] mt-1 font-medium">94.2% Overall Attendance</p>
          </div>

          <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-4 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
            <div className="flex items-center justify-between text-[#4B6B5E] text-xs mb-1 font-semibold">
              <span>AT-RISK (&lt;75%)</span>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="text-2xl font-extrabold text-amber-700">4 Students</div>
            <p className="text-[11px] text-[#4B6B5E] mt-1 font-medium">Intervention alerts active</p>
          </div>

          <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-4 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
            <div className="flex items-center justify-between text-[#4B6B5E] text-xs mb-1 font-semibold">
              <span>CO-PO ATTAINMENT</span>
              <Award className="w-4 h-4 text-[#1D4ED8]" />
            </div>
            <div className="text-2xl font-extrabold text-[#047857]">89.6%</div>
            <p className="text-[11px] text-[#4B6B5E] mt-1 font-medium">NBA Criterion 3 compliant</p>
          </div>
        </div>

        {/* Notification Toast */}
        {exportNotice && (
          <div className="p-3.5 rounded-xl bg-[#F0FAF5] border border-[#34D399] text-[#047857] text-xs flex items-center gap-2 shadow-sm">
            <CheckCircle2 className="w-4 h-4 text-[#047857] shrink-0" />
            <span className="font-semibold">{exportNotice}</span>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 1: RELATIVE GRADING SANDBOX */}
        {/* ==================================================================== */}
        {activeTab === "grading" && (
          <div className="space-y-6">
            <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-6 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0B2E22] flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-[#1D4ED8]" />
                    Relative Grading Gaussian Sandbox
                  </h2>
                  <p className="text-xs text-[#4B6B5E] mt-1">
                    Simulate real-time grade normalizations across cohort scores. Automatically calibrates GPA bands before committing final marks to university ledger.
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    onClick={() => setGapAwareActive(!gapAwareActive)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 ${
                      gapAwareActive
                        ? "bg-[#34D399] text-[#0B2E22] border border-[#047857]"
                        : "bg-white border border-[#CDEBDD] text-[#0B2E22] hover:border-[#34D399]"
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" />
                    <span>{gapAwareActive ? "Gap-Aware Active (14 Rescued)" : "Enable Gap-Aware (GMM/DP)"}</span>
                  </button>

                  <button
                    onClick={() => setPhotoOcrModal(true)}
                    className="px-3 py-2 rounded-xl bg-white border border-[#CDEBDD] text-[#0B2E22] hover:border-[#34D399] text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Camera className="w-3.5 h-3.5 text-[#1D4ED8]" />
                    <span>Photo OCR Ingest</span>
                  </button>

                  <button
                    onClick={() => handleExport("pdf")}
                    className="px-3 py-2 rounded-xl bg-[#FACC15] text-[#0B2E22] hover:bg-[#EAB308] text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export PDF</span>
                  </button>
                </div>
              </div>

              {/* Gap-Aware Status Banner */}
              {gapAwareActive && (
                <div className="p-3.5 mb-6 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-xs flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      <strong>Eq 4.3 Gap-Aware Cutoff Active:</strong> Cutoffs dropped to natural score boundaries. 14 students trapped in $[c - 1.0, c)$ have been promoted without grade inflation.
                    </span>
                  </div>
                  <span className="font-mono font-bold text-emerald-700">Heartbreak Trapped: 0</span>
                </div>
              )}

              {/* Sliders Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 p-4 rounded-xl bg-white border border-[#CDEBDD] mb-6">
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-[#4B6B5E] mb-2">
                    <span>Mean Shift Adjustment:</span>
                    <span className="font-mono text-[#047857] font-bold">{meanShift > 0 ? `+${meanShift}` : meanShift} marks</span>
                  </div>
                  <input
                    type="range"
                    min="-5"
                    max="5"
                    step="0.5"
                    disabled={gapAwareActive}
                    value={meanShift}
                    onChange={(e) => setMeanShift(parseFloat(e.target.value))}
                    className="w-full accent-[#34D399] cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-[10px] text-[#7A968A]">Compensates for high exam paper variance</span>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-[#4B6B5E] mb-2">
                    <span>Standard Deviation Spread:</span>
                    <span className="font-mono text-[#047857] font-bold">{stdScale.toFixed(2)}x</span>
                  </div>
                  <input
                    type="range"
                    min="0.8"
                    max="1.3"
                    step="0.05"
                    disabled={gapAwareActive}
                    value={stdScale}
                    onChange={(e) => setStdScale(parseFloat(e.target.value))}
                    className="w-full accent-[#34D399] cursor-pointer disabled:opacity-50"
                  />
                  <span className="text-[10px] text-[#7A968A]">Widens or narrows Gaussian distribution tails</span>
                </div>
              </div>

              {/* Chart */}
              <div className="h-64 w-full bg-white p-4 rounded-xl border border-[#CDEBDD]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#CDEBDD" />
                    <XAxis dataKey="grade" stroke="#4B6B5E" fontSize={11} />
                    <YAxis stroke="#4B6B5E" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#F0FAF5",
                        borderColor: "#CDEBDD",
                        borderRadius: "8px",
                        color: "#0B2E22",
                        fontSize: "12px",
                      }}
                    />
                    <Bar dataKey="adjusted" fill="#34D399" radius={[4, 4, 0, 0]} name="Students" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Photo OCR Modal */}
            {photoOcrModal && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                <div className="bg-white border border-[#CDEBDD] rounded-xl max-w-lg w-full p-6 space-y-4 shadow-xl">
                  <div className="flex items-center justify-between border-b border-[#CDEBDD] pb-3">
                    <h3 className="text-base font-bold text-[#0B2E22] flex items-center gap-2">
                      <Camera className="w-5 h-5 text-[#1D4ED8]" />
                      Computer Vision Marks Ingestion Result
                    </h3>
                    <button
                      onClick={() => setPhotoOcrModal(false)}
                      className="text-xs text-[#4B6B5E] hover:text-[#0B2E22]"
                    >
                      ✕ Close
                    </button>
                  </div>

                  <div className="p-3 bg-amber-50 border border-amber-300 rounded-lg text-xs space-y-1">
                    <span className="font-bold text-amber-900">⚠️ Row 3 Arithmetic Checksum Discrepancy Flagged:</span>
                    <p className="text-amber-800">
                      On student Rohan Patel (21CS044): Q1(7.5) + Q2(8.0) + Q3(12.0) + Q4(11.5) = <strong>39.0</strong>, but professor wrote <strong>36.0</strong> on physical paper sheet.
                    </p>
                    <p className="font-semibold text-[#047857]">Action: Verified via automatic recalculation before ledger commit.</p>
                  </div>

                  <div className="text-xs space-y-1 text-[#4B6B5E]">
                    <p>• Homography 4-Point Warp: <strong>Success</strong></p>
                    <p>• Mean OCR Confidence: <strong>96.4%</strong></p>
                    <p>• Rows Extracted: <strong>10 Rows Verified</strong></p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[#CDEBDD]">
                    <button
                      onClick={() => {
                        setPhotoOcrModal(false);
                        setExportNotice("Photo OCR marks committed with corrected checksums!");
                      }}
                      className="px-4 py-2 rounded-lg bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] text-xs font-bold"
                    >
                      Confirm & Commit Marks
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: AT-RISK FORECASTER */}
        {/* ==================================================================== */}
        {activeTab === "attendance" && (
          <div className="space-y-6">
            <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-5 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
              <h2 className="text-lg font-bold text-[#0B2E22] flex items-center gap-2 mb-1">
                <Activity className="w-5 h-5 text-[#1D4ED8]" />
                At-Risk Student Early Warning Radar (&lt; 75% Attendance)
              </h2>
              <p className="text-xs text-[#4B6B5E]">
                Automated statistical projection identifies students heading toward examination debarment 3 weeks before finals.
              </p>
            </div>

            <div className="bg-white border border-[#CDEBDD] rounded-xl overflow-hidden shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#F0FAF5] border-b border-[#CDEBDD] text-[#4B6B5E] font-bold">
                    <tr>
                      <th className="p-3.5">STUDENT NAME</th>
                      <th className="p-3.5">ROLL NUMBER</th>
                      <th className="p-3.5">COURSE</th>
                      <th className="p-3.5">CURRENT ATTENDANCE</th>
                      <th className="p-3.5">STATUS</th>
                      <th className="p-3.5">RECOMMENDED ACTION</th>
                      <th className="p-3.5">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CDEBDD] text-[#0B2E22]">
                    {SAMPLE_AT_RISK_STUDENTS.map((st) => (
                      <tr key={st.id} className="hover:bg-[#F0FAF5]/50">
                        <td className="p-3.5 font-bold">{st.name}</td>
                        <td className="p-3.5 font-mono text-[#4B6B5E]">{st.roll}</td>
                        <td className="p-3.5 font-semibold text-[#047857]">{st.course}</td>
                        <td className="p-3.5">
                          <span className={`font-bold ${st.attendance < 68 ? "text-red-600" : "text-amber-600"}`}>
                            {st.attendance}%
                          </span>
                        </td>
                        <td className="p-3.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            st.status === "Critical"
                              ? "bg-red-100 text-red-800 border border-red-300"
                              : "bg-amber-100 text-amber-800 border border-amber-300"
                          }`}>
                            {st.status}
                          </span>
                        </td>
                        <td className="p-3.5 text-[#4B6B5E]">{st.recommended}</td>
                        <td className="p-3.5">
                          <button
                            onClick={() => setExportNotice(`Dispatched formal intervention notice to ${st.name} (${st.roll})`)}
                            className="px-2.5 py-1 rounded bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] text-[11px] font-bold"
                          >
                            Dispatch Notice
                          </button>
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
        {/* TAB 3: ITEM ANALYSIS & NBA */}
        {/* ==================================================================== */}
        {activeTab === "audit" && (
          <div className="space-y-6">
            <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-5 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
              <h2 className="text-lg font-bold text-[#0B2E22] flex items-center gap-2 mb-1">
                <Award className="w-5 h-5 text-[#1D4ED8]" />
                Item Response Theory (IRT 2PL) & NBA Criterion 3 Audit
              </h2>
              <p className="text-xs text-[#4B6B5E]">
                Evaluates question paper discrimination point-biserial (r_pbis) and verifies Higher-Order Thinking Skills (HOTS &ge; 40%).
              </p>
            </div>

            {/* Negative Discrimination Alert */}
            <div className="p-4 bg-red-50 border border-red-300 rounded-xl text-xs space-y-1 text-red-900">
              <span className="font-bold flex items-center gap-1.5 text-red-800">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                Defective Question Detected: Q6 (r_pbis = -0.24)
              </span>
              <p className="text-red-800">
                Question 6 exhibits negative point-biserial discrimination. Top-performing students scored lower than low-ability students due to ambiguous phrasing on read-committed serialization.
              </p>
              <p className="font-bold text-red-900 mt-1">
                System Recommendation: Drop Q6 and redistribute 10 marks across Q1 and Q4, or grant 10 grace marks.
              </p>
            </div>

            {/* Questions Table */}
            <div className="bg-white border border-[#CDEBDD] rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F0FAF5] border-b border-[#CDEBDD] text-[#4B6B5E] font-bold">
                  <tr>
                    <th className="p-3.5">QUESTION</th>
                    <th className="p-3.5">TOPIC</th>
                    <th className="p-3.5">BLOOM LEVEL</th>
                    <th className="p-3.5">DISCRIMINATION (r_pbis)</th>
                    <th className="p-3.5">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#CDEBDD] text-[#0B2E22]">
                  {SAMPLE_QUESTION_AUDIT.map((q) => (
                    <tr key={q.id} className={q.discrimination < 0 ? "bg-red-50/50" : ""}>
                      <td className="p-3.5 font-mono font-bold text-[#1D4ED8]">{q.id}</td>
                      <td className="p-3.5 font-bold">{q.topic}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#FEF9C3] text-[#713F12]">
                          {q.bloom}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold">
                        <span className={q.discrimination < 0 ? "text-red-600 font-extrabold" : "text-[#047857]"}>
                          {q.discrimination.toFixed(2)}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium">{q.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: DEPARTMENT OVERVIEW */}
        {/* ==================================================================== */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-5 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
              <h2 className="text-lg font-bold text-[#0B2E22] flex items-center gap-2 mb-1">
                <BarChart3 className="w-5 h-5 text-[#1D4ED8]" />
                Computer Science & Engineering Department Overview
              </h2>
              <p className="text-xs text-[#4B6B5E]">
                Northstar Institute of Technology · Autonomous Tier · 2026 Academic Session
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {SAMPLE_COURSES.map((c) => (
                <div key={c.id} className="p-5 bg-white border border-[#CDEBDD] rounded-xl space-y-2 shadow-sm">
                  <span className="font-mono text-xs font-bold text-[#1D4ED8]">{c.code}</span>
                  <h3 className="text-sm font-bold text-[#0B2E22]">{c.title}</h3>
                  <div className="pt-2 border-t border-[#CDEBDD] text-xs text-[#4B6B5E] space-y-1">
                    <p>• Enrolled Students: <strong>{c.enrolled}</strong></p>
                    <p>• Average Score: <strong>{c.avgScore}%</strong></p>
                    <p>• Projected Pass Rate: <strong>{c.passRate}%</strong></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
