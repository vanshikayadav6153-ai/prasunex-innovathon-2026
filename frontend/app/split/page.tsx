"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Server,
  Layers,
  ExternalLink,
  RefreshCw,
  Maximize2,
  Columns,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Terminal,
} from "lucide-react";
import { Logo } from "@/components/Logo";

import {getReadiness} from "@/lib/platform";

type ViewMode = "split-50" | "split-70-30" | "split-30-70" | "frontend-only" | "backend-only";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");

export default function UnifiedFullStackView() {
  const [viewMode, setViewMode] = useState<ViewMode>("split-50");
  const [frontendRoute, setFrontendRoute] = useState("/login");
  const [backendRoute, setBackendRoute] = useState("/docs");
  const [frontendKey, setFrontendKey] = useState(0);
  const [backendKey, setBackendKey] = useState(0);
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);

  // Health check for Backend (:8000)
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const res = await getReadiness(API_BASE_URL);
        setBackendOnline(res.ready);
      } catch (err) {
        setBackendOnline(false);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col bg-white text-[#0B2E22] font-sans overflow-hidden">
      {/* Top Unified Control Header */}
      <header className="h-14 bg-white border-b border-[#CDEBDD] px-4 flex items-center justify-between shrink-0 shadow-[0_1px_2px_rgba(11,46,34,0.06)] z-20">
        <div className="flex items-center gap-4">
          <Logo size="sm" showTagline={false} />
          <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#F0FAF5] border border-[#CDEBDD] text-xs font-bold text-[#047857]">
            <Layers className="w-3.5 h-3.5" />
            Full-Stack Live Workspace
          </span>
        </div>

        {/* View Mode Switcher Pills */}
        <div className="flex items-center gap-1 bg-[#F0FAF5] p-1 rounded-xl border border-[#CDEBDD] text-xs font-semibold">
          <button
            onClick={() => setViewMode("split-50")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === "split-50"
                ? "bg-[#34D399] text-[#0B2E22] font-bold shadow-sm"
                : "text-[#4B6B5E] hover:text-[#0B2E22]"
            }`}
            title="50 / 50 Balanced View"
          >
            <Columns className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">50 / 50 Split</span>
          </button>

          <button
            onClick={() => setViewMode("split-70-30")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === "split-70-30"
                ? "bg-[#34D399] text-[#0B2E22] font-bold shadow-sm"
                : "text-[#4B6B5E] hover:text-[#0B2E22]"
            }`}
            title="Frontend Focused (70% Frontend, 30% Backend)"
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Frontend Priority</span>
          </button>

          <button
            onClick={() => setViewMode("split-30-70")}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              viewMode === "split-30-70"
                ? "bg-[#34D399] text-[#0B2E22] font-bold shadow-sm"
                : "text-[#4B6B5E] hover:text-[#0B2E22]"
            }`}
            title="Backend Focused (30% Frontend, 70% Backend)"
          >
            <Server className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">API Priority</span>
          </button>

          <button
            onClick={() => setViewMode("frontend-only")}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              viewMode === "frontend-only"
                ? "bg-[#34D399] text-[#0B2E22] font-bold shadow-sm"
                : "text-[#4B6B5E] hover:text-[#0B2E22]"
            }`}
            title="Frontend Only"
          >
            UI
          </button>

          <button
            onClick={() => setViewMode("backend-only")}
            className={`px-2.5 py-1.5 rounded-lg transition-all ${
              viewMode === "backend-only"
                ? "bg-[#34D399] text-[#0B2E22] font-bold shadow-sm"
                : "text-[#4B6B5E] hover:text-[#0B2E22]"
            }`}
            title="Backend Only"
          >
            API
          </button>
        </div>

        {/* Backend Status & Quick Links */}
        <div className="flex items-center gap-2.5">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-[#CDEBDD] text-xs font-medium">
            <span
              className={`w-2 h-2 rounded-full ${
                backendOnline ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            <span className="text-[#0B2E22] font-semibold">Backend:</span>
            <span className="font-mono text-[#047857] text-[11px]">{API_BASE_URL.replace(/^https?:\/\//, "")}</span>
          </div>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] text-xs font-bold transition-all shadow-sm flex items-center gap-1"
          >
            <span>Exit Split</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Split Panels */}
      <div className="flex-1 flex min-h-0 bg-[#F0FAF5] p-2 gap-2">
        {/* LEFT / FRONTEND PANEL */}
        {viewMode !== "backend-only" && (
          <div
            className={`flex flex-col bg-white border border-[#CDEBDD] rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
              viewMode === "frontend-only"
                ? "w-full"
                : viewMode === "split-70-30"
                ? "w-8/12"
                : viewMode === "split-30-70"
                ? "w-4/12"
                : "w-1/2"
            }`}
          >
            {/* Frontend Sub-header Bar */}
            <div className="h-10 bg-[#F0FAF5] border-b border-[#CDEBDD] px-3 flex items-center justify-between text-xs font-semibold text-[#0B2E22]">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-4 h-4 text-[#047857]" />
                <span className="font-bold">Frontend Next.js Application</span>
                <span className="font-mono text-[10px] text-[#4B6B5E] bg-white border border-[#CDEBDD] px-2 py-0.5 rounded-md">
                  :3000
                </span>
              </div>

              <div className="flex items-center gap-2">
                {/* Route Selector */}
                <select
                  value={frontendRoute}
                  onChange={(e) => {
                    setFrontendRoute(e.target.value);
                    setFrontendKey((k) => k + 1);
                  }}
                  className="bg-white border border-[#CDEBDD] rounded-lg px-2 py-1 text-[11px] font-medium text-[#0B2E22] focus:outline-none focus:border-[#34D399]"
                >
                  <option value="/login">Login / Register (/login)</option>
                  <option value="/student/dashboard">Student Dashboard</option>
                  <option value="/faculty/dashboard">Faculty Dashboard</option>
                  <option value="/admin/dashboard">Admin Dashboard</option>
                  <option value="/other/dashboard">Operations Dashboard</option>
                </select>

                <button
                  onClick={() => setFrontendKey((k) => k + 1)}
                  className="p-1 rounded-md text-[#4B6B5E] hover:text-[#0B2E22] hover:bg-white transition-all"
                  title="Reload Frontend Frame"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <a
                  href={`http://localhost:3000${frontendRoute}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded-md text-[#4B6B5E] hover:text-[#0B2E22] hover:bg-white transition-all"
                  title="Open in New Tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Iframe */}
            <iframe
              key={`fe-${frontendKey}`}
              src={`http://localhost:3000${frontendRoute}`}
              title="Frontend View"
              className="flex-1 w-full h-full border-none bg-white"
            />
          </div>
        )}

        {/* RIGHT / BACKEND PANEL */}
        {viewMode !== "frontend-only" && (
          <div
            className={`flex flex-col bg-white border border-[#CDEBDD] rounded-xl overflow-hidden shadow-sm transition-all duration-300 ${
              viewMode === "backend-only"
                ? "w-full"
                : viewMode === "split-70-30"
                ? "w-4/12"
                : viewMode === "split-30-70"
                ? "w-8/12"
                : "w-1/2"
            }`}
          >
            {/* Backend Sub-header Bar */}
            <div className="h-10 bg-[#F0FAF5] border-b border-[#CDEBDD] px-3 flex items-center justify-between text-xs font-semibold text-[#0B2E22]">
              <div className="flex items-center gap-2">
                <Server className="w-4 h-4 text-[#1D4ED8]" />
                <span className="font-bold">Backend FastAPI Interactive Swagger Docs</span>
                <span className="font-mono text-[10px] text-[#4B6B5E] bg-white border border-[#CDEBDD] px-2 py-0.5 rounded-md">
                  :8000
                </span>
              </div>

              <div className="flex items-center gap-2">
                <select
                  value={backendRoute}
                  onChange={(e) => {
                    setBackendRoute(e.target.value);
                    setBackendKey((k) => k + 1);
                  }}
                  className="bg-white border border-[#CDEBDD] rounded-lg px-2 py-1 text-[11px] font-medium text-[#0B2E22] focus:outline-none focus:border-[#34D399]"
                >
                  <option value="/docs">Swagger Interactive Docs (/docs)</option>
                  <option value="/redoc">ReDoc Specification (/redoc)</option>
                  <option value="/openapi.json">OpenAPI Schema JSON</option>
                </select>

                <button
                  onClick={() => setBackendKey((k) => k + 1)}
                  className="p-1 rounded-md text-[#4B6B5E] hover:text-[#0B2E22] hover:bg-white transition-all"
                  title="Reload Backend Frame"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>

                <a
                  href={`${API_BASE_URL}${backendRoute}`}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1 rounded-md text-[#4B6B5E] hover:text-[#0B2E22] hover:bg-white transition-all"
                  title="Open API in New Tab"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Iframe */}
            <iframe
              key={`be-${backendKey}`}
              src={`${API_BASE_URL}${backendRoute}`}
              title="Backend API Docs"
              className="flex-1 w-full h-full border-none bg-white"
            />
          </div>
        )}
      </div>

      {/* Bottom Live Footer Bar */}
      <footer className="h-8 bg-white border-t border-[#CDEBDD] px-4 flex items-center justify-between text-[11px] text-[#4B6B5E] shrink-0 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Frontend: <strong className="text-[#0B2E22]">Next.js 14 (:3000)</strong>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Backend: <strong className="text-[#0B2E22]">FastAPI + Uvicorn (:8000)</strong>
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#047857]" />
            Database: <strong className="text-[#0B2E22]">SQLite (campus_nexus.db)</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <span>Prasunex Innovathon 2026</span>
          <span className="font-mono text-[#047857] font-bold">100% Local Run</span>
        </div>
      </footer>
    </div>
  );
}
