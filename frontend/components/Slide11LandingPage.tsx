"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Sparkles,
  ArrowRight,
  Play,
  Building2,
  GraduationCap,
  TrendingUp,
  ShieldCheck,
  Bot,
  CheckCircle,
  Quote,
  ChevronLeft,
  ChevronRight,
  BookOpen,
} from "lucide-react";
import { HeroDashboardMockup } from "./HeroDashboardMockup";
import { PlatformHighlightsSection } from "./PlatformHighlightsSection";
import { FeatureCard } from "./FeatureCard";
import { GlassCard } from "./GlassCard";
import { SectionHeader } from "./SectionHeader";
import { Logo } from "./Logo";
import ChatWidget from "./ChatWidget";
import { STATS_DATA, FEATURES_DATA, TESTIMONIALS } from "@/data/landing";

interface Slide11LandingPageProps {
  onLogin: () => void;
  onDemo: () => void;
  onDemoRole: (roleKey: string) => void;
  user?: any;
  onBackToConsole?: () => void;
}

export function Slide11LandingPage({
  onLogin,
  onDemo,
  onDemoRole,
  user,
  onBackToConsole,
}: Slide11LandingPageProps) {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  const statIcons: Record<string, any> = {
    Building2,
    GraduationCap,
    TrendingUp,
    ShieldCheck,
  };

  return (
    <div className="min-h-screen bg-white text-[#0B2E22] selection:bg-[#34D399]/30 relative overflow-x-hidden font-sans">
      <main className="relative z-10">
        {/* =================================================================
            HERO SECTION
            ================================================================= */}
        <section className="flex min-h-screen items-center px-4 py-10 sm:px-6 lg:h-screen lg:min-h-0 lg:px-8 lg:py-8">
          <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-10 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Hero Text & Call-To-Actions */}
            <div className="flex flex-col items-start space-y-5 text-left lg:col-span-6 lg:space-y-5">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase bg-[#FEF9C3] border border-[#FACC15] text-[#713F12] shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#EAB308]" />
                <span>AI-POWERED SMART CAMPUS PLATFORM</span>
              </div>

              {/* Headline */}
              <h1 className="text-[2.5rem] font-black leading-[1.12] tracking-tight text-[#0F5C4C] sm:text-[3rem] lg:text-[3.25rem]">
                One Campus. <br />
                One Intelligence. <br />
                <span className="text-[#047857]">Better Decisions.</span>
              </h1>

              {/* Subhead Tagline */}
              <p className="text-base sm:text-lg text-[#4B6B5E] font-normal leading-relaxed max-w-xl">
                Empowering universities with predictive academic analytics,
                zero-knowledge grievance safety, automated grading, and cognitive
                infrastructure.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2 w-full sm:w-auto">
                {user ? (
                  <button
                    onClick={onBackToConsole}
                    className="px-7 py-3.5 rounded-xl text-sm font-bold bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] flex items-center gap-2 shadow-sm transition-all"
                  >
                    <span>Return to Console ({user.college_code})</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => onDemoRole("student")}
                      className="px-7 py-3.5 rounded-xl text-sm font-bold bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] flex items-center gap-2 shadow-sm transition-all"
                    >
                      <span>Explore Live Demo</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <a
                      href="#features"
                      className="px-6 py-3.5 rounded-xl text-sm font-semibold text-[#0B2E22] bg-[#F0FAF5] hover:bg-white border border-[#CDEBDD] transition-all flex items-center gap-2 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 text-[#047857] fill-[#047857]" />
                      <span>Watch 2-Min Tour</span>
                    </a>
                  </>
                )}
              </div>

            </div>

            {/* Right Column: Hero Dashboard Mockup */}
            <div className="lg:col-span-6 relative flex justify-center">
              <HeroDashboardMockup />
            </div>
          </div>
        </section>

        <PlatformHighlightsSection onDemoRole={onDemoRole} />

        {/* =================================================================
            4-STATS STRIP
            ================================================================= */}
        <section className="py-10 border-y border-[#CDEBDD] bg-[#F0FAF5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
              {STATS_DATA.map((stat, i) => {
                const IconComponent = statIcons[stat.icon] || Building2;
                return (
                  <div
                    key={i}
                    className="relative group p-4 sm:p-5 rounded-xl bg-white border border-[#CDEBDD] hover:border-[#34D399] transition-all duration-300 text-center flex flex-col items-center justify-center shadow-sm"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#F0FAF5] border border-[#CDEBDD] flex items-center justify-center text-[#047857] mb-3 group-hover:scale-110 transition-transform">
                      <IconComponent className="w-5 h-5 text-[#047857]" />
                    </div>
                    <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#0B2E22] tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-xs sm:text-sm text-[#4B6B5E] font-medium mt-1">
                      {stat.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* =================================================================
            FEATURE CARDS GRID
            ================================================================= */}
        <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <SectionHeader
            badge="CUTTING-EDGE INTELLIGENCE"
            title={
              <>
                Engineered for Modern <br className="hidden sm:inline" />
                <span className="text-[#047857]">Academic Excellence</span>
              </>
            }
            subtitle="Six purpose-built cognitive engines that solve root-cause learning gaps, eliminate exam bottlenecks, and safeguard student trust."
          />

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES_DATA.map((feature) => (
              <FeatureCard
                key={feature.id}
                feature={feature}
                onClick={() => onDemoRole("student")}
              />
            ))}
          </div>
        </section>

        {/* =================================================================
            FOR EVERY ROLE SECTION
            ================================================================= */}
        <section id="portals" className="py-20 border-t border-[#CDEBDD] bg-[#F0FAF5]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <SectionHeader
              badge="ROLE-BASED PORTALS"
              title={
                <>
                  Built for Every Role <br className="hidden sm:inline" />
                  <span className="text-[#047857]">on Campus</span>
                </>
              }
              subtitle="Select your persona to enter an interactive workspace seeded with real-time synthetic cohort data."
            />

            <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Role 1: Student */}
              <GlassCard
                glow="mint"
                className="flex flex-col justify-between p-8"
                onClick={() => onDemoRole("student")}
              >
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-white border border-[#CDEBDD] flex items-center justify-center mb-6 shadow-sm">
                    <Image
                      src="/images/student.svg"
                      alt="Student"
                      width={44}
                      height={44}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#047857] uppercase tracking-widest">
                    Student Portal
                  </span>
                  <h3 className="text-2xl font-black text-[#0B2E22] mt-1 mb-2">
                    Learn. Improve. Grow.
                  </h3>
                  <p className="text-sm text-[#4B6B5E] leading-relaxed">
                    Personalized mastery paths, Grade Time Machine scenario
                    simulation, AI revision drills, and anonymous safety desks.
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDemoRole("student");
                  }}
                  className="mt-8 w-full py-3 text-xs font-bold rounded-xl bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] flex items-center justify-center gap-2 shadow-sm transition-all"
                >
                  <span>Explore as Student</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </GlassCard>

              {/* Role 2: Professor */}
              <GlassCard
                glow="gold"
                className="flex flex-col justify-between p-8"
                onClick={() => onDemoRole("professor_hod")}
              >
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-white border border-[#CDEBDD] flex items-center justify-center mb-6 shadow-sm">
                    <Image
                      src="/images/professor.svg"
                      alt="Professor"
                      width={44}
                      height={44}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#1D4ED8] uppercase tracking-widest">
                    Faculty Portal
                  </span>
                  <h3 className="text-2xl font-black text-[#0B2E22] mt-1 mb-2">
                    Analyse. Guide. Support.
                  </h3>
                  <p className="text-sm text-[#4B6B5E] leading-relaxed">
                    Relative grading curve sandbox, question discrimination
                    item audits (IRT), attendance early warnings, and cohort mastery.
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDemoRole("professor_hod");
                  }}
                  className="mt-8 w-full py-3 rounded-xl text-xs font-bold bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>Explore as Faculty</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </GlassCard>

              {/* Role 3: Administrator */}
              <GlassCard
                glow="none"
                className="flex flex-col justify-between p-8"
                onClick={() => onDemoRole("chancellor_dean")}
              >
                <div>
                  <div className="w-16 h-16 rounded-2xl bg-white border border-[#CDEBDD] flex items-center justify-center mb-6 shadow-sm">
                    <Image
                      src="/images/admin.svg"
                      alt="Administrator"
                      width={44}
                      height={44}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-xs font-bold text-[#B91C1C] uppercase tracking-widest">
                    Admin & Operations
                  </span>
                  <h3 className="text-2xl font-black text-[#0B2E22] mt-1 mb-2">
                    Manage. Optimise. Ensure.
                  </h3>
                  <p className="text-sm text-[#4B6B5E] leading-relaxed">
                    NBA/NAAC accreditation evidence mapping, automated SLA
                    service desk, facilities triage, and tenant billing.
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDemoRole("chancellor_dean");
                  }}
                  className="mt-8 w-full py-3 rounded-xl text-xs font-bold bg-[#FACC15] hover:bg-[#EAB308] text-[#0B2E22] flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  <span>Explore as Administrator</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </GlassCard>
            </div>
          </div>
        </section>

        {/* =================================================================
            AI INSIGHTS & TESTIMONIALS
            ================================================================= */}
        <section id="insights" className="py-24 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
          <SectionHeader
            badge="CAMPUS PERSPECTIVES"
            title="Trusted Across University Ecosystems"
            subtitle="How students, faculty, and administrative leaders experience CAMPUS-NEXUS."
          />

          <div className="mt-12 relative rounded-xl bg-[#F0FAF5] border border-[#CDEBDD] p-8 sm:p-12 shadow-sm">
            <Quote className="w-10 h-10 text-[#047857]/30 mb-4" />
            <p className="text-lg sm:text-xl text-[#0B2E22] font-medium italic leading-relaxed min-h-[90px]">
              &ldquo;{TESTIMONIALS[activeTestimonial].quote}&rdquo;
            </p>

            <div className="mt-8 pt-6 border-t border-[#CDEBDD] flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white border border-[#CDEBDD] flex items-center justify-center overflow-hidden">
                  <Image
                    src={TESTIMONIALS[activeTestimonial].avatar}
                    alt={TESTIMONIALS[activeTestimonial].author}
                    width={32}
                    height={32}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#0B2E22]">
                    {TESTIMONIALS[activeTestimonial].author}
                  </h4>
                  <p className="text-xs text-[#4B6B5E]">
                    {TESTIMONIALS[activeTestimonial].title}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-[#FEF9C3] text-[#713F12] border border-[#FACC15] px-3 py-1 rounded-full font-semibold">
                  {TESTIMONIALS[activeTestimonial].badge}
                </span>
                <div className="flex items-center gap-1 ml-2">
                  <button
                    aria-label="Previous Testimonial"
                    onClick={() =>
                      setActiveTestimonial((prev) =>
                        prev === 0 ? TESTIMONIALS.length - 1 : prev - 1
                      )
                    }
                    className="p-1.5 rounded-lg bg-white border border-[#CDEBDD] hover:bg-[#F0FAF5] text-[#0B2E22]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    aria-label="Next Testimonial"
                    onClick={() =>
                      setActiveTestimonial((prev) =>
                        (prev + 1) % TESTIMONIALS.length
                      )
                    }
                    className="p-1.5 rounded-lg bg-white border border-[#CDEBDD] hover:bg-[#F0FAF5] text-[#0B2E22]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* =================================================================
            PRESENTATION TEAM FOOTER
            ================================================================= */}
        <footer id="about" className="border-t border-[#CDEBDD] bg-[#F0FAF5] py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col items-center md:items-start space-y-2">
              <Logo size="md" showTagline={true} />
              <p className="text-xs text-[#4B6B5E] max-w-sm text-center md:text-left">
                The AI-powered smart campus operating system bridging students,
                academics, and operations.
              </p>
            </div>

            <div className="flex items-center gap-6 text-xs text-[#4B6B5E] font-medium">
              <button
                onClick={() => onDemoRole("student")}
                className="hover:text-[#0B2E22] transition-colors"
              >
                Student Portal
              </button>
              <button
                onClick={() => onDemoRole("professor_hod")}
                className="hover:text-[#0B2E22] transition-colors"
              >
                Professor Studio
              </button>
              <button
                onClick={() => onDemoRole("chancellor_dean")}
                className="hover:text-[#0B2E22] transition-colors"
              >
                Admin Console
              </button>
              <button
                onClick={onLogin}
                className="hover:text-[#047857] text-[#0B2E22] transition-colors font-bold"
              >
                Sign In
              </button>
            </div>

            <div className="text-center md:text-right text-xs text-[#4B6B5E]">
              <p className="font-semibold text-[#0B2E22]">
                Team: Prasunex Innovators
              </p>
              <p>Prasunex Innovathon 2026 · Live Competition Prototype</p>
            </div>
          </div>
        </footer>
        <ChatWidget />
      </main>
    </div>
  );
}
