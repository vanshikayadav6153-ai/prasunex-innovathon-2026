import { NextResponse } from "next/server";
import { createHash, randomBytes } from "node:crypto";
import bcrypt from "bcryptjs";
import { addUser, createJWT, findUserByEmail, UserRecord } from "@/lib/server-data";

interface GoogleTokenInfo {
  aud?: string;
  email?: string;
  email_verified?: string | boolean;
  exp?: string;
  iss?: string;
  name?: string;
}

export async function POST(request: Request) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  if (!clientId) {
    return NextResponse.json(
      { detail: "Google sign-in is not configured. Set NEXT_PUBLIC_GOOGLE_CLIENT_ID." },
      { status: 503 }
    );
  }

  let credential: unknown;
  try {
    ({ credential } = await request.json());
  } catch {
    return NextResponse.json({ detail: "A Google credential is required." }, { status: 400 });
  }

  if (typeof credential !== "string" || credential.length === 0 || credential.length > 10_000) {
    return NextResponse.json({ detail: "A valid Google credential is required." }, { status: 400 });
  }

  const tokenInfoUrl = new URL("https://oauth2.googleapis.com/tokeninfo");
  tokenInfoUrl.searchParams.set("id_token", credential);

  let tokenInfo: GoogleTokenInfo;
  try {
    const response = await fetch(tokenInfoUrl, { cache: "no-store" });
    if (!response.ok) {
      return NextResponse.json({ detail: "Google could not verify this sign-in." }, { status: 401 });
    }
    tokenInfo = (await response.json()) as GoogleTokenInfo;
  } catch {
    return NextResponse.json({ detail: "Google sign-in verification is temporarily unavailable." }, { status: 502 });
  }

  const expiresAt = Number(tokenInfo.exp);
  const validIssuer = tokenInfo.iss === "accounts.google.com" || tokenInfo.iss === "https://accounts.google.com";
  if (
    tokenInfo.aud !== clientId ||
    (tokenInfo.email_verified !== "true" && tokenInfo.email_verified !== true) ||
    !tokenInfo.email ||
    !validIssuer ||
    !Number.isFinite(expiresAt) ||
    expiresAt <= Math.floor(Date.now() / 1000)
  ) {
    return NextResponse.json({ detail: "Google returned an invalid or expired sign-in." }, { status: 401 });
  }

  let user = await findUserByEmail(tokenInfo.email);
  let accountCreated = false;

  if (!user) {
    const normalizedEmail = tokenInfo.email.trim().toLowerCase();
    const fullName = tokenInfo.name?.trim() || normalizedEmail.split("@")[0];
    const passwordHash = await bcrypt.hash(randomBytes(32).toString("hex"), 10);
    const newUser: UserRecord = {
      id: `usr-google-${createHash("sha256").update(normalizedEmail).digest("hex").slice(0, 24)}`,
      tenant_id: "northstar",
      college_name: "Northstar Institute of Technology",
      college_code: "NITX",
      tier: "autonomous_enterprise",
      tier_name: "Autonomous Enterprise",
      features: { zk_grievance: true, bkt_diagnostics: true, relative_grading: true, early_warning: true },
      email: normalizedEmail,
      full_name: fullName,
      name: fullName,
      role: "student",
      normalized_role: "student",
      department: "CSE",
      passwordHash,
      cgpa: 0,
      karma_points: 0,
      opt_in_recruiter: false,
      is_new_account: true,
    };

    await addUser(newUser);
    user = newUser;
    accountCreated = true;
  }

  const { accessToken, refreshToken } = createJWT(user);
  const safeUser = {
    id: user.id,
    tenant_id: user.tenant_id,
    college_name: user.college_name,
    college_code: user.college_code,
    tier: user.tier,
    tier_name: user.tier_name,
    features: user.features,
    email: user.email,
    full_name: user.full_name,
    name: user.name,
    role: user.role,
    normalized_role: user.normalized_role,
    department: user.department,
    cgpa: user.cgpa,
    karma_points: user.karma_points,
    opt_in_recruiter: user.opt_in_recruiter,
    is_new_account: Boolean(user.is_new_account),
  };

  return NextResponse.json({
    access_token: accessToken,
    refresh_token: refreshToken,
    token_type: "bearer",
    account_created: accountCreated,
    user: safeUser,
  });
}
