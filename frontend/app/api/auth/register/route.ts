import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail, addUser, createJWT, UserRecord } from "@/lib/server-data";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password, role = "student", department = "CSE", college = "NITX" } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ detail: "Name, email, and password are required." }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ detail: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const normRole = (role || "").toLowerCase().trim();
    if (normRole === "admin") {
      return NextResponse.json({ detail: "Public registration for Administrator role is strictly prohibited." }, { status: 403 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const existing = await findUserByEmail(normalizedEmail);
    if (existing) {
      return NextResponse.json({ detail: "An account with this email already exists." }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const normalizedRole = normRole === "faculty" ? "faculty" : normRole === "student" ? "student" : "other";

    const newUser: UserRecord = {
      id: `usr-${Date.now()}`,
      tenant_id: "northstar",
      college_name: "Northstar Institute of Technology",
      college_code: college || "NITX",
      tier: "autonomous_enterprise",
      tier_name: "Autonomous Enterprise",
      features: { zk_grievance: true, bkt_diagnostics: true, relative_grading: true, early_warning: true },
      email: normalizedEmail,
      full_name: name.trim(),
      name: name.trim(),
      role: normalizedRole,
      normalized_role: normalizedRole,
      department: department || "CSE",
      passwordHash,
      cgpa: 0,
      karma_points: 0,
      opt_in_recruiter: false,
      is_new_account: true,
    };

    await addUser(newUser);
    const { accessToken, refreshToken } = createJWT(newUser);

    const safeUser = {
      id: newUser.id,
      tenant_id: newUser.tenant_id,
      college_name: newUser.college_name,
      college_code: newUser.college_code,
      tier: newUser.tier,
      tier_name: newUser.tier_name,
      features: newUser.features,
      email: newUser.email,
      full_name: newUser.full_name,
      name: newUser.name,
      role: newUser.role,
      normalized_role: newUser.normalized_role,
      department: newUser.department,
      cgpa: newUser.cgpa,
      karma_points: newUser.karma_points,
      opt_in_recruiter: newUser.opt_in_recruiter,
      is_new_account: true,
    };

    const response = NextResponse.json({
      access_token: accessToken,
      accessToken,
      refresh_token: refreshToken,
      refreshToken,
      token_type: "bearer",
      account_created: true,
      user: safeUser,
    });

    response.cookies.set("nexus_session", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (err: any) {
    if (err?.code === "23505") {
      return NextResponse.json({ detail: "An account with this email already exists." }, { status: 409 });
    }
    return NextResponse.json({ detail: err.message || "Failed to register account" }, { status: 500 });
  }
}
