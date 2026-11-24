"use client";
import { useState } from "react";
import Link from "next/link";
import { Building2, BookOpen, Activity, Menu, X } from "lucide-react";
import { Logo } from "./Logo";
import { ThemeToggle } from "./ThemeToggle";
import { campusGaps, modules, portalNames, type Persona } from "@/data/modules";
import { useAuth, getDashboardPathForRole } from "@/context/AuthContext";

const snapshots = {
  student: [
    ["Performance", "78.5%"],
    ["Attendance", "86%"],
    ["Mastery", "72%"],
  ],
  faculty: [
    ["Course sections", "3"],
    ["Questions reviewed", "14"],
    ["Items flagged", "2"],
  ],
  admin: [
    ["Open tickets", "12"],
    ["Due today", "4"],
    ["Assets to inspect", "3"],
  ],
};

export function CampusShowcase() {
  const [role, setRole] = useState<Persona>("student");
  const [navOpen, setNavOpen] = useState(false);
  const { user } = useAuth();
  const closeNav = () => setNavOpen(false);
  return (
    <main className="nx">
      <header className="nx-header">
        <Logo showTagline={false} />
        <button
          className="nx-menu"
          type="button"
          aria-expanded={navOpen}
          aria-controls="campus-navigation"
          aria-label={navOpen ? "Close navigation" : "Open navigation"}
          onClick={() => setNavOpen((v) => !v)}
        >
          {navOpen ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav
          id="campus-navigation"
          className={navOpen ? "nx-nav-open" : ""}
          aria-label="Main"
        >
          <a href="#features" onClick={closeNav}>
            Features
          </a>
          <a href="#plans" onClick={closeNav}>
            Plans
          </a>
          <Link href="/modules" onClick={closeNav}>
            Catalog
          </Link>
          <ThemeToggle />
          <Link
            className="nx-button"
            href={user ? getDashboardPathForRole(user.role) : "/login"}
            onClick={closeNav}
          >
            {user ? "Dashboard" : "Sign in"}
          </Link>
        </nav>
      </header>
      <div className="nx-wrap">
        <section className="nx-hero">
          <div>
            <h1>
              One Campus.
              <br />
              One Intelligence.
              <br />
              <em>Better Decisions.</em>
            </h1>
            <p>
              Connect academic performance, campus operations and student
              wellbeing through connected AI.
            </p>
            <a className="nx-button" href="#preview">
              Explore a campus preview →
            </a>
          </div>
          <div className="nx-preview" id="preview">
            <small>DEMO · fictitious campus data</small>
            <div className="nx-switch">
              {(Object.keys(portalNames) as Persona[]).map((r) => (
                <button
                  key={r}
                  aria-pressed={role === r}
                  onClick={() => setRole(r)}
                >
                  {r === "faculty"
                    ? "Faculty"
                    : r === "admin"
                      ? "Admin"
                      : "Student"}
                </button>
              ))}
            </div>
            <p className="sr-only" role="status" aria-live="polite">
              Showing {portalNames[role]} preview.
            </p>
            <h2>{portalNames[role]}</h2>
            <dl>
              {snapshots[role].map(([k, v]) => (
                <div key={k}>
                  <dt>{k}</dt>
                  <dd>{v}</dd>
                </div>
              ))}
            </dl>
            <div
              className="nx-bars"
              aria-label="Illustrative trend, demo data only"
            >
              {[42, 66, 54, 82, 72, 88].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
            <Link href={"/preview/" + role}>Open this preview →</Link>
          </div>
        </section>
        <section className="nx-section" id="features">
          <div className="nx-heading">
            <h2>Learning & assessment</h2>
            <Link href="/modules">All 15 modules →</Link>
          </div>
          <div className="nx-grid">
            {modules
              .filter((m) =>
                ["m01", "m05", "m06", "m07", "m11", "m15"].includes(m.id),
              )
              .map((m) => (
                <Link className="nx-card" href={"/modules/" + m.id} key={m.id}>
                  <small>{portalNames[m.role]}</small>
                  <h3>{m.name}</h3>
                  <p>{m.action} →</p>
                </Link>
              ))}
          </div>
        </section>
        <section className="nx-section">
          <h2>How the campus responds</h2>
          <div className="nx-grid">
            {[
              [
                BookOpen,
                "Explain",
                "Trace a difficult topic back to a missing prerequisite.",
              ],
              [
                Activity,
                "Fix",
                "Review duplicate tickets and assign a repair before the SLA expires.",
              ],
              [
                Building2,
                "Protect",
                "Route sensitive reports to an authorized committee. Privacy review is pending.",
              ],
            ].map(([Icon, title, desc]) => {
              const Mark = Icon as typeof BookOpen;
              return (
                <article className="nx-card" key={String(title)}>
                  <Mark aria-hidden="true" />
                  <h3>{String(title)}</h3>
                  <p>{String(desc)}</p>
                </article>
              );
            })}
          </div>
        </section>
        <section className="nx-section">
          <h2>Eight campus gaps</h2>
          <div className="nx-gaps">
            {campusGaps.map((g, i) => (
              <Link
                key={g}
                href={
                  "/modules/" +
                  ["m01", "m05", "m03", "m02", "m14", "m09", "m08", "m13"][i]
                }
              >
                {g} ↗
              </Link>
            ))}
          </div>
        </section>
        <section className="nx-section" id="plans">
          <h2>Institution plans</h2>
          <p>
            Proposed pricing from the project specification · reviewed 22 Nov
            2026.
          </p>
          <div className="nx-grid">
            {[
              ["Pilot", "One semester free", "One department, four modules"],
              [
                "Core",
                "₹250 / student / year",
                "Academic assessment and student learning",
              ],
              ["Plus", "₹450 / student / year", "All 15 modules"],
              ["University", "Custom", "Institutional deployment and support"],
            ].map(([p, v, d]) => (
              <article className="nx-card" key={p}>
                <small>{p}</small>
                <h3>{v}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
          <a href="mailto:?subject=Campus%20Nexus%20pilot%20demo&body=Hello%2C%20I%20would%20like%20to%20arrange%20a%20Campus%20Nexus%20pilot%20demo.">
            Draft a demo request to your campus coordinator ↗
          </a>
        </section>
      </div>
    </main>
  );
}
