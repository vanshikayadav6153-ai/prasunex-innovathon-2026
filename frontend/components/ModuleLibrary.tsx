import Link from "next/link";
import { modules, portalNames, type Persona } from "@/data/modules";
export function ModuleLibrary({ role }: { role?: Persona }) {
  return (
    <section className="nx-section">
      <div className="nx-heading">
        <h2>{role ? "Explore your modules" : "Module catalog"}</h2>
        <span>DEMO · example workflows</span>
      </div>
      <div className="nx-grid">
        {modules
          .filter((m) => !role || m.role === role)
          .map((m) => (
            <Link
              className="nx-card"
              aria-label={`Open ${m.name}`}
              key={m.id}
              href={"/modules/" + m.id}
            >
              <small>
                {m.id.toUpperCase()} · {portalNames[m.role]}
              </small>
              <h3>{m.name}</h3>
              <p>{m.action} →</p>
            </Link>
          ))}
      </div>
    </section>
  );
}
