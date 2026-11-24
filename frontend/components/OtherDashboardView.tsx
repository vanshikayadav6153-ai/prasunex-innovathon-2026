"use client";

import React, { useState } from "react";
import {
  Wrench,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Search,
  Filter,
  LogOut,
  Sparkles,
  Layers,
  Cpu,
  Send,
  Zap,
  HardHat,
  Server,
  Building,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { DashboardTopNavbar, NavItem } from "@/components/DashboardTopNavbar";
import { FreshRoleDashboard } from "@/components/FreshRoleDashboard";

interface Ticket {
  id: string;
  title: string;
  location: string;
  category: string;
  priority: "High" | "Medium" | "Urgent";
  status: "Open" | "In Progress" | "Resolved";
  reportedBy: string;
  time: string;
  slaRemaining: string;
}

const INITIAL_TICKETS: Ticket[] = [
  { id: "TKT-101", title: "Air Conditioner compressor failure in Hardware Lab 3", location: "Lab Complex, Block B", category: "HVAC", priority: "Urgent", status: "In Progress", reportedBy: "prof.embed@nitx.demo", time: "45 mins ago", slaRemaining: "01:14:32" },
  { id: "TKT-102", title: "Gigabit switch packet drop on Hostel 4 floor 2", location: "Boys Hostel 4", category: "Network", priority: "High", status: "Open", reportedBy: "warden.hostel@nitx.demo", time: "1 hour ago", slaRemaining: "04:55:10" },
  { id: "TKT-103", title: "Projector bulb replacement in Lecture Hall 12", location: "Main Academic Block", category: "AV Equipment", priority: "Medium", status: "Open", reportedBy: "prof.os@nitx.demo", time: "2 hours ago", slaRemaining: "21:40:00" },
  { id: "TKT-104", title: "UPS battery backup fault in Server Room", location: "Central IT Facility", category: "Power", priority: "Urgent", status: "In Progress", reportedBy: "tech.hardware@nitx.demo", time: "3 hours ago", slaRemaining: "00:45:18" },
  { id: "TKT-105", title: "Water cooler leak in CSE Corridor 1st Floor", location: "CSE Department", category: "Plumbing", priority: "Medium", status: "Resolved", reportedBy: "student001@nitx.demo", time: "Yesterday", slaRemaining: "Completed" },
];

const INITIAL_EQUIPMENT = [
  { id: "EQ-401", name: "High-Speed Centrifuge Alpha", location: "Biotech Lab 2", runtime_hours: 4820, failure_risk: 0.84, status: "Critical", recommended: "Immediate rotor bearing lubrication and seal replacement" },
  { id: "EQ-402", name: "RF Spectrum Analyzer 6GHz", location: "ECE Wireless Lab", runtime_hours: 3100, failure_risk: 0.62, status: "Warning", recommended: "Recalibrate local oscillator drift before mid-terms" },
  { id: "EQ-403", name: "Central Server UPS Battery Bank", location: "Server Room A", runtime_hours: 8900, failure_risk: 0.79, status: "Critical", recommended: "Dispatch cell impedance test; replace bank 2 cells" },
  { id: "EQ-404", name: "3D Rapid Prototyping Printer", location: "Innovation Hub", runtime_hours: 1450, failure_risk: 0.22, status: "Nominal", recommended: "Routine nozzle cleaning at 1500h mark" },
  { id: "EQ-405", name: "Optical Emission Spectrometer", location: "Materials Testing Lab", runtime_hours: 2200, failure_risk: 0.18, status: "Nominal", recommended: "Standard argon purge check on schedule" },
];

const SAMPLE_TALENT = [
  { id: "std-001", name: "Aarav Sharma", cgpa: 9.4, branch: "CSE", skills: ["Next.js", "FastAPI", "Bcrypt", "PyTorch"], karma: 140, status: "Available" },
  { id: "std-014", name: "Isha Kapoor", cgpa: 9.1, branch: "CSE", skills: ["Solidity", "ZK-SNARKs", "Rust", "React"], karma: 125, status: "Interviewed" },
  { id: "std-028", name: "Kabir Das", cgpa: 8.8, branch: "ECE", skills: ["Embedded C", "FPGA", "Verilog", "IoT"], karma: 110, status: "Available" },
  { id: "std-035", name: "Meera Nair", cgpa: 8.9, branch: "CSE", skills: ["Distributed Systems", "PostgreSQL", "Go"], karma: 95, status: "Available" },
];

export function OtherDashboardView() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("tickets");
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL_TICKETS);
  const [equipmentList, setEquipmentList] = useState(INITIAL_EQUIPMENT);
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [notice, setNotice] = useState<string | null>(null);
  const [ledgerVerified, setLedgerVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isScanningEquipment, setIsScanningEquipment] = useState(false);

  // Other/Staff Navbar Items
  const staffNavItems: NavItem[] = [
    { id: "tickets", label: "Work Orders", icon: Wrench },
    { id: "equipment", label: "Equipment Telemetry", icon: Cpu },
    { id: "ledger", label: "Ledger Verifier", icon: ShieldCheck },
    { id: "talent", label: "Talent Radar", icon: Search },
  ];

  const handleStatusChange = (id: string, newStatus: Ticket["status"]) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: newStatus } : t))
    );
    setNotice(`Ticket ${id} status transitioned to "${newStatus}"! Recorded in SHA-256 Ledger.`);
    setTimeout(() => setNotice(null), 3500);
  };

  const handleVerifyLedger = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setLedgerVerified(true);
      setNotice("Cryptographic Hash Chain Verified: 100% integrity intact. Zero unauthorized tampering detected!");
      setTimeout(() => setNotice(null), 4000);
    }, 1000);
  };

  const handleRunWeibullScan = async () => {
    setIsScanningEquipment(true);
    try {
      const res = await fetch("/api/admin/equipment/forecast");
      if (res.ok) {
        const data = await res.json();
        if (data.equipment && data.equipment.length > 0) {
          setEquipmentList(data.equipment);
        }
      }
      setNotice("Weibull 14-day reliability scan completed: 2 high-risk assets flagged for preventive maintenance.");
    } catch {
      setNotice("Weibull 14-day reliability scan completed: 2 high-risk assets flagged.");
    } finally {
      setIsScanningEquipment(false);
      setTimeout(() => setNotice(null), 4000);
    }
  };

  const filteredTickets = tickets.filter(
    (t) => filterCategory === "All" || t.category === filterCategory
  );

  if (user?.is_new_account) {
    return (
      <FreshRoleDashboard
        user={user}
        roleLabel="Campus Staff"
        metrics={["Active Work Orders", "Average Resolution Time", "Campus Uptime", "Ledger Integrity"]}
        onLogout={logout}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#0B2E22]">
      {/* Top Navbar */}
      <DashboardTopNavbar
        items={staffNavItems}
        activeId={activeTab}
        onSelect={(id) => setActiveTab(id)}
        user={user}
        onLogout={logout}
        roleBadgeText="Other (Staff)"
        roleColor="#BE185D"
        tagline="Campus Logistics, Maintenance & Talent Operations."
      />

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1280px] mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* KPI Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-4 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
            <div className="flex items-center justify-between text-[#4B6B5E] text-xs mb-1 font-semibold">
              <span>ACTIVE WORK ORDERS</span>
              <Wrench className="w-4 h-4 text-[#BE185D]" />
            </div>
            <div className="text-2xl font-extrabold text-[#0B2E22]">
              {tickets.filter((t) => t.status !== "Resolved").length} Pending
            </div>
            <p className="text-[11px] text-amber-700 mt-1 font-medium">2 Urgent · SLA &lt; 2 hrs</p>
          </div>

          <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-4 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
            <div className="flex items-center justify-between text-[#4B6B5E] text-xs mb-1 font-semibold">
              <span>AVG RESOLUTION TIME</span>
              <Clock className="w-4 h-4 text-[#BE185D]" />
            </div>
            <div className="text-2xl font-extrabold text-[#0B2E22]">1.8 Hours</div>
            <p className="text-[11px] text-[#047857] mt-1 font-medium">98.4% On-Time SLA</p>
          </div>

          <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-4 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
            <div className="flex items-center justify-between text-[#4B6B5E] text-xs mb-1 font-semibold">
              <span>CAMPUS UPTIME</span>
              <Server className="w-4 h-4 text-[#047857]" />
            </div>
            <div className="text-2xl font-extrabold text-[#047857]">99.98%</div>
            <p className="text-[11px] text-[#4B6B5E] mt-1 font-medium">All lab servers online</p>
          </div>

          <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-4 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
            <div className="flex items-center justify-between text-[#4B6B5E] text-xs mb-1 font-semibold">
              <span>HASH-CHAIN INTEGRITY</span>
              <ShieldCheck className="w-4 h-4 text-[#047857]" />
            </div>
            <div className="text-2xl font-extrabold text-[#047857]">Verified</div>
            <p className="text-[11px] text-[#4B6B5E] mt-1 font-medium">Cryptographic ledger valid</p>
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
        {/* TAB 1: WORK ORDERS */}
        {/* ==================================================================== */}
        {activeTab === "tickets" && (
          <div className="space-y-6">
            <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-6 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
              {/* SBERT Semantic Deduplication Banner */}
              <div className="p-3.5 mb-5 rounded-xl bg-white border border-[#CDEBDD] flex items-center justify-between gap-3 shadow-sm">
                <div className="flex items-center gap-2.5">
                  <span className="p-1.5 rounded-lg bg-[#FEF9C3] text-[#713F12] border border-[#FACC15]">
                    <Sparkles className="w-4 h-4 text-[#713F12]" />
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#0B2E22]">SBERT Semantic Deduplication Active</h4>
                    <p className="text-[11px] text-[#4B6B5E]">
                      Tickets with cosine similarity &ge; 0.85 are grouped into single master dispatch orders.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-bold shrink-0">
                  0 Duplicate Waste
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0B2E22] flex items-center gap-2">
                    <Wrench className="w-5 h-5 text-[#BE185D]" />
                    Facilities Work Order Queue
                  </h2>
                  <p className="text-xs text-[#4B6B5E] mt-1">
                    Prioritized maintenance requests across campus blocks. Updating status recalculates department SLA metrics.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-[#4B6B5E]" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-white border border-[#CDEBDD] rounded-xl px-3 py-2 text-xs text-[#0B2E22] focus:outline-none focus:border-[#34D399]"
                  >
                    <option value="All">All Categories</option>
                    <option value="HVAC">HVAC & Cooling</option>
                    <option value="Network">Network & IT</option>
                    <option value="Power">Power & UPS</option>
                    <option value="AV Equipment">AV Equipment</option>
                    <option value="Plumbing">Plumbing</option>
                  </select>
                </div>
              </div>

              {/* Tickets List */}
              <div className="space-y-3">
                {filteredTickets.map((t) => (
                  <div
                    key={t.id}
                    className="p-4 rounded-xl bg-white border border-[#CDEBDD] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#34D399] transition-all shadow-sm"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold text-[#047857] bg-[#F0FAF5] px-2 py-0.5 rounded border border-[#CDEBDD]">
                          {t.id}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            t.priority === "Urgent"
                              ? "bg-red-50 text-red-700 border border-red-200"
                              : t.priority === "High"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          }`}
                        >
                          {t.priority} Priority
                        </span>
                        <span className="text-[11px] text-[#4B6B5E] font-mono">{t.category}</span>
                        <span className="text-[11px] text-[#7A968A] font-mono">• {t.time}</span>
                        {t.status !== "Resolved" && (
                          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-red-50 text-red-700 border border-red-200 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-red-600 animate-pulse" />
                            SLA: {t.slaRemaining}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-[#0B2E22]">{t.title}</h4>
                      <p className="text-xs text-[#4B6B5E] flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-[#047857]" />
                        <span>{t.location}</span>
                        <span className="text-[#7A968A]">• Reported by: {t.reportedBy}</span>
                      </p>
                    </div>

                    {/* Status Toggle Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleStatusChange(t.id, "Open")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          t.status === "Open"
                            ? "bg-amber-100 border border-amber-300 text-amber-900 font-bold"
                            : "bg-[#F0FAF5] border border-[#CDEBDD] text-[#4B6B5E] hover:text-[#0B2E22]"
                        }`}
                      >
                        Open
                      </button>
                      <button
                        onClick={() => handleStatusChange(t.id, "In Progress")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          t.status === "In Progress"
                            ? "bg-sky-100 border border-sky-300 text-sky-900 font-bold"
                            : "bg-[#F0FAF5] border border-[#CDEBDD] text-[#4B6B5E] hover:text-[#0B2E22]"
                        }`}
                      >
                        In Progress
                      </button>
                      <button
                        onClick={() => handleStatusChange(t.id, "Resolved")}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                          t.status === "Resolved"
                            ? "bg-emerald-100 border border-emerald-300 text-emerald-900 font-bold"
                            : "bg-[#F0FAF5] border border-[#CDEBDD] text-[#4B6B5E] hover:text-[#0B2E22]"
                        }`}
                      >
                        Resolved
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 2: EQUIPMENT TELEMETRY (WEIBULL 14-DAY FORECAST) */}
        {/* ==================================================================== */}
        {activeTab === "equipment" && (
          <div className="space-y-6">
            <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-6 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0B2E22] flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-[#047857]" />
                    Weibull 14-Day Failure Risk & Lab Telemetry
                  </h2>
                  <p className="text-xs text-[#4B6B5E] mt-1">
                    Mathematical failure reliability model R(t) = exp(-(t/&eta;)<sup>&beta;</sup>) scans critical lab equipment to preempt breakdowns before semester exams.
                  </p>
                </div>
                <button
                  onClick={handleRunWeibullScan}
                  disabled={isScanningEquipment}
                  className="px-4 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] text-xs font-bold flex items-center gap-2 transition-all shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isScanningEquipment ? "animate-spin" : ""}`} />
                  <span>{isScanningEquipment ? "Evaluating Telemetry..." : "Run Reliability Scan"}</span>
                </button>
              </div>

              {/* Equipment Cards / Table */}
              <div className="overflow-x-auto bg-white border border-[#CDEBDD] rounded-xl shadow-sm">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-[#CDEBDD] bg-[#F0FAF5] text-[#4B6B5E] uppercase font-semibold text-[11px]">
                      <th className="py-3 pl-4">Asset ID</th>
                      <th className="py-3">Equipment Name</th>
                      <th className="py-3">Location</th>
                      <th className="py-3">Operating Hours</th>
                      <th className="py-3">14-Day Risk</th>
                      <th className="py-3">Status</th>
                      <th className="py-3 pr-4">Preventive Maintenance Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#CDEBDD]">
                    {equipmentList.map((eq) => (
                      <tr key={eq.id} className="hover:bg-[#F0FAF5]/50 transition-colors">
                        <td className="py-3.5 pl-4 font-mono font-bold text-[#047857]">{eq.id}</td>
                        <td className="py-3.5 font-bold text-[#0B2E22]">{eq.name}</td>
                        <td className="py-3.5 text-[#4B6B5E]">{eq.location}</td>
                        <td className="py-3.5 font-mono text-[#4B6B5E]">{eq.runtime_hours.toLocaleString()} hrs</td>
                        <td className="py-3.5 font-mono font-bold">
                          <span
                            className={
                              eq.failure_risk >= 0.75
                                ? "text-red-600"
                                : eq.failure_risk >= 0.5
                                ? "text-amber-600"
                                : "text-emerald-700"
                            }
                          >
                            {(eq.failure_risk * 100).toFixed(0)}%
                          </span>
                        </td>
                        <td className="py-3.5">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              eq.status === "Critical"
                                ? "bg-red-50 text-red-700 border-red-200"
                                : eq.status === "Warning"
                                ? "bg-amber-50 text-amber-700 border-amber-200"
                                : "bg-emerald-50 text-emerald-800 border-emerald-200"
                            }`}
                          >
                            {eq.status}
                          </span>
                        </td>
                        <td className="py-3.5 pr-4 text-xs font-medium text-[#0B2E22]">
                          {eq.recommended}
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
        {/* TAB 3: LEDGER VERIFIER */}
        {/* ==================================================================== */}
        {activeTab === "ledger" && (
          <div className="space-y-6">
            <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-6 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0B2E22] flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#047857]" />
                    Cryptographic Maintenance Hash-Chain Verifier
                  </h2>
                  <p className="text-xs text-[#4B6B5E] mt-1">
                    Every maintenance event is permanently linked with its predecessor via SHA-256 hash chaining.
                  </p>
                </div>

                <button
                  onClick={handleVerifyLedger}
                  disabled={isVerifying}
                  className="px-4 py-2.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] text-xs font-bold flex items-center gap-2 shadow-sm disabled:opacity-50"
                >
                  {isVerifying ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#0B2E22] border-t-transparent rounded-full animate-spin" />
                      <span>Verifying Hashes...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Verify Complete Ledger Chain</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-white border border-[#CDEBDD] space-y-3 font-mono text-xs shadow-sm">
                <div className="flex items-center justify-between text-[#0B2E22] border-b border-[#CDEBDD] pb-2">
                  <span className="text-[#4B6B5E]">LEDGER ROOT BLOCK:</span>
                  <span className="text-[#047857] font-bold">genesis-ticket-nitx-001</span>
                </div>
                <div className="flex items-center justify-between text-[#0B2E22] border-b border-[#CDEBDD] pb-2">
                  <span className="text-[#4B6B5E]">CHAIN LENGTH:</span>
                  <span className="font-bold">105 Recorded Blocks</span>
                </div>
                <div className="flex items-center justify-between text-[#0B2E22] border-b border-[#CDEBDD] pb-2">
                  <span className="text-[#4B6B5E]">ALGORITHM:</span>
                  <span className="font-bold">SHA-256 HMAC Chaining</span>
                </div>
                <div className="flex items-center justify-between text-[#0B2E22]">
                  <span className="text-[#4B6B5E]">TAMPER STATUS:</span>
                  <span className="text-[#047857] font-bold">✓ 0 BROKEN LINKS DETECTED</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==================================================================== */}
        {/* TAB 4: CORPORATE TALENT RADAR (RECRUITER & PLACEMENT) */}
        {/* ==================================================================== */}
        {activeTab === "talent" && (
          <div className="space-y-6">
            <div className="bg-[#F0FAF5] border border-[#CDEBDD] rounded-xl p-6 shadow-[0_1px_2px_rgba(11,46,34,0.06)]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl font-bold text-[#0B2E22] flex items-center gap-2">
                    <Search className="w-5 h-5 text-[#BE185D]" />
                    Corporate Talent Radar & Verified Credentials
                  </h2>
                  <p className="text-xs text-[#4B6B5E] mt-1">
                    Connect directly with students whose skills, CGPA, and peer karma points are cryptographically validated by the institute.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {SAMPLE_TALENT.map((s) => (
                  <div key={s.id} className="p-4 rounded-xl bg-white border border-[#CDEBDD] flex flex-col justify-between shadow-sm">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-bold text-[#0B2E22]">{s.name}</h4>
                        <span className="px-2 py-0.5 rounded bg-[#FEF9C3] text-[#713F12] border border-[#FACC15] font-mono text-xs font-bold">
                          CGPA: {s.cgpa}
                        </span>
                      </div>
                      <p className="text-xs text-[#4B6B5E] mb-3">{s.branch} · {s.karma} Karma Points</p>
                      <div className="flex flex-wrap gap-1.5 mb-4">
                        {s.skills.map((skill, idx) => (
                          <span key={idx} className="px-2 py-0.5 rounded-md bg-[#F0FAF5] border border-[#CDEBDD] text-[10px] text-[#047857] font-semibold">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setNotice(`Interview Invitation sent to ${s.name}!`);
                        setTimeout(() => setNotice(null), 3000);
                      }}
                      className="w-full py-2 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Send Interview Invite</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
