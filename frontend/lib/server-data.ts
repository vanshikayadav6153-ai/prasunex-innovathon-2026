import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Pool } from "pg";

const JWT_SECRET = process.env.JWT_SECRET || "campus-nexus-v2-super-secret-jwt-key-2026-hackathon";

export interface UserRecord {
  id: string;
  tenant_id: string;
  college_name: string;
  college_code: string;
  tier: string;
  tier_name: string;
  features: Record<string, boolean>;
  email: string;
  full_name: string;
  name: string;
  role: string;
  normalized_role: "student" | "faculty" | "admin" | "other";
  department: string;
  passwordHash: string;
  cgpa?: number;
  karma_points?: number;
  opt_in_recruiter?: boolean;
  is_new_account?: boolean;
}

// In-memory data store for serverless execution
export const SEED_USERS: UserRecord[] = [
  {
    id: "usr-admin",
    tenant_id: "northstar",
    college_name: "Northstar Institute of Technology",
    college_code: "NITX",
    tier: "autonomous_enterprise",
    tier_name: "Autonomous Enterprise",
    features: { zk_grievance: true, bkt_diagnostics: true, relative_grading: true, early_warning: true },
    email: "admin@nitx.demo",
    full_name: "Chief Administrator",
    name: "Chief Administrator",
    role: "admin",
    normalized_role: "admin",
    department: "Administration",
    passwordHash: bcrypt.hashSync("Admin@123", 10),
  },
  {
    id: "usr-faculty",
    tenant_id: "northstar",
    college_name: "Northstar Institute of Technology",
    college_code: "NITX",
    tier: "autonomous_enterprise",
    tier_name: "Autonomous Enterprise",
    features: { zk_grievance: true, bkt_diagnostics: true, relative_grading: true, early_warning: true },
    email: "faculty@nitx.demo",
    full_name: "Prof. Vikram Sen",
    name: "Prof. Vikram Sen",
    role: "faculty",
    normalized_role: "faculty",
    department: "CSE",
    passwordHash: bcrypt.hashSync("Faculty@123", 10),
  },
  {
    id: "usr-student-001",
    tenant_id: "northstar",
    college_name: "Northstar Institute of Technology",
    college_code: "NITX",
    tier: "autonomous_enterprise",
    tier_name: "Autonomous Enterprise",
    features: { zk_grievance: true, bkt_diagnostics: true, relative_grading: true, early_warning: true },
    email: "student@nitx.demo",
    full_name: "Aarav Sharma",
    name: "Aarav Sharma",
    role: "student",
    normalized_role: "student",
    department: "CSE",
    cgpa: 9.4,
    karma_points: 140,
    opt_in_recruiter: true,
    passwordHash: bcrypt.hashSync("Student@123", 10),
  },
  {
    id: "usr-staff",
    tenant_id: "northstar",
    college_name: "Northstar Institute of Technology",
    college_code: "NITX",
    tier: "autonomous_enterprise",
    tier_name: "Autonomous Enterprise",
    features: { zk_grievance: true, bkt_diagnostics: true, relative_grading: true, early_warning: true },
    email: "staff@nitx.demo",
    full_name: "Sunil Verma (Lab Warden)",
    name: "Sunil Verma (Lab Warden)",
    role: "other",
    normalized_role: "other",
    department: "Facilities",
    passwordHash: bcrypt.hashSync("Staff@123", 10),
  },
  // Legacy Aliases
  {
    id: "usr-legacy-prof",
    tenant_id: "northstar",
    college_name: "Northstar Institute of Technology",
    college_code: "NITX",
    tier: "autonomous_enterprise",
    tier_name: "Autonomous Enterprise",
    features: { zk_grievance: true, bkt_diagnostics: true, relative_grading: true, early_warning: true },
    email: "professor@nitx.demo",
    full_name: "Prof. Priya Mehta",
    name: "Prof. Priya Mehta",
    role: "faculty",
    normalized_role: "faculty",
    department: "CSE",
    passwordHash: bcrypt.hashSync("professor", 10),
  },
  {
    id: "usr-legacy-std",
    tenant_id: "northstar",
    college_name: "Northstar Institute of Technology",
    college_code: "NITX",
    tier: "autonomous_enterprise",
    tier_name: "Autonomous Enterprise",
    features: { zk_grievance: true, bkt_diagnostics: true, relative_grading: true, early_warning: true },
    email: "student001@nitx.demo",
    full_name: "Student Demo",
    name: "Student Demo",
    role: "student",
    normalized_role: "student",
    department: "CSE",
    cgpa: 8.8,
    karma_points: 90,
    passwordHash: bcrypt.hashSync("student123", 10),
  },
];

declare global {
  var __campusNexusRuntimeUsers: UserRecord[] | undefined;
  var __campusNexusAuthPool: Pool | undefined;
  var __campusNexusAuthSchemaReady: Promise<void> | undefined;
}

const databaseUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL || process.env.POSTGRES_URL_NON_POOLING;
const authPool = databaseUrl
  ? globalThis.__campusNexusAuthPool || (globalThis.__campusNexusAuthPool = new Pool({
      connectionString: databaseUrl,
      ssl: databaseUrl.includes("localhost") ? undefined : { rejectUnauthorized: false },
      max: 5,
      idleTimeoutMillis: 10_000,
      connectionTimeoutMillis: 5_000,
    }))
  : null;

async function ensureAuthSchema(): Promise<void> {
  if (!authPool) return;
  globalThis.__campusNexusAuthSchemaReady ||= authPool.query(`
    CREATE TABLE IF NOT EXISTS campus_nexus_auth_users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      full_name TEXT NOT NULL,
      role TEXT NOT NULL,
      normalized_role TEXT NOT NULL,
      department TEXT NOT NULL DEFAULT 'CSE',
      password_hash TEXT NOT NULL,
      college_code TEXT NOT NULL DEFAULT 'NITX',
      tenant_id TEXT NOT NULL DEFAULT 'northstar',
      college_name TEXT NOT NULL DEFAULT 'Northstar Institute of Technology',
      tier TEXT NOT NULL DEFAULT 'autonomous_enterprise',
      tier_name TEXT NOT NULL DEFAULT 'Autonomous Enterprise',
      features JSONB NOT NULL DEFAULT '{}'::jsonb,
      cgpa DOUBLE PRECISION NOT NULL DEFAULT 0,
      karma_points INTEGER NOT NULL DEFAULT 0,
      opt_in_recruiter BOOLEAN NOT NULL DEFAULT FALSE,
      is_new_account BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `).then(() => undefined);
  await globalThis.__campusNexusAuthSchemaReady;
}

function requireProductionDatabase(): void {
  if (!authPool && process.env.NODE_ENV === "production") {
    throw new Error("Persistent account storage is not configured. Connect DATABASE_URL to a PostgreSQL database.");
  }
}

function rowToUser(row: Record<string, any>): UserRecord {
  return {
    id: row.id,
    tenant_id: row.tenant_id,
    college_name: row.college_name,
    college_code: row.college_code,
    tier: row.tier,
    tier_name: row.tier_name,
    features: row.features || {},
    email: row.email,
    full_name: row.full_name,
    name: row.full_name,
    role: row.role,
    normalized_role: row.normalized_role,
    department: row.department,
    passwordHash: row.password_hash,
    cgpa: Number(row.cgpa || 0),
    karma_points: Number(row.karma_points || 0),
    opt_in_recruiter: Boolean(row.opt_in_recruiter),
    is_new_account: Boolean(row.is_new_account),
  };
}

// Use PostgreSQL for registered accounts in production; keep demo seeds and a local-only fallback.
const runtimeUsers =
  globalThis.__campusNexusRuntimeUsers ||
  (globalThis.__campusNexusRuntimeUsers = [...SEED_USERS]);

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const normEmail = email.trim().toLowerCase();
  const seeded = SEED_USERS.find((user) => user.email.toLowerCase() === normEmail);
  if (seeded) return seeded;

  requireProductionDatabase();
  if (!authPool) return runtimeUsers.find((user) => user.email.toLowerCase() === normEmail);

  await ensureAuthSchema();
  const result = await authPool.query("SELECT * FROM campus_nexus_auth_users WHERE email = $1 LIMIT 1", [normEmail]);
  return result.rows[0] ? rowToUser(result.rows[0]) : undefined;
}

export async function addUser(user: UserRecord): Promise<void> {
  requireProductionDatabase();
  if (!authPool) {
    runtimeUsers.push(user);
    return;
  }

  await ensureAuthSchema();
  await authPool.query(
    `INSERT INTO campus_nexus_auth_users (
      id, email, full_name, role, normalized_role, department, password_hash,
      college_code, tenant_id, college_name, tier, tier_name, features,
      cgpa, karma_points, opt_in_recruiter, is_new_account
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13::jsonb, $14, $15, $16, $17)`,
    [
      user.id, user.email.trim().toLowerCase(), user.full_name, user.role, user.normalized_role,
      user.department, user.passwordHash, user.college_code, user.tenant_id, user.college_name,
      user.tier, user.tier_name, JSON.stringify(user.features), user.cgpa || 0,
      user.karma_points || 0, user.opt_in_recruiter || false, user.is_new_account || false,
    ]
  );
}

export async function updateUserPassword(email: string, passwordHash: string): Promise<boolean> {
  const normEmail = email.trim().toLowerCase();
  requireProductionDatabase();
  if (!authPool) {
    const user = runtimeUsers.find((entry) => entry.email.toLowerCase() === normEmail);
    if (!user) return false;
    user.passwordHash = passwordHash;
    return true;
  }

  await ensureAuthSchema();
  const result = await authPool.query(
    "UPDATE campus_nexus_auth_users SET password_hash = $1, is_new_account = FALSE WHERE email = $2",
    [passwordHash, normEmail]
  );
  return (result.rowCount || 0) > 0;
}

export async function verifyUserPassword(rawPassword: string, user: UserRecord): Promise<boolean> {
  if (await bcrypt.compare(rawPassword, user.passwordHash)) {
    return true;
  }
  // Dual-credential aliases
  const aliasMap: Record<string, string[]> = {
    "admin@nitx.demo": ["Admin@123", "admin"],
    "faculty@nitx.demo": ["Faculty@123", "faculty123"],
    "professor@nitx.demo": ["Faculty@123", "professor"],
    "student@nitx.demo": ["Student@123", "student123"],
    "student001@nitx.demo": ["Student@123", "student123"],
    "staff@nitx.demo": ["Staff@123", "technician"],
  };
  const aliases = aliasMap[user.email.toLowerCase()] || [];
  return aliases.includes(rawPassword);
}

export function createJWT(user: UserRecord): { accessToken: string; refreshToken: string } {
  const payload = {
    sub: user.id,
    email: user.email,
    role: user.role,
    normalized_role: user.normalized_role,
    tenant_id: user.tenant_id,
  };
  const accessToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
  const refreshToken = jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
  return { accessToken, refreshToken };
}

export function verifyJWT(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}
