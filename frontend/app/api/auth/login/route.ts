import { NextResponse } from "next/server";
import { findUserByEmail, verifyUserPassword, createJWT } from "@/lib/server-data";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ detail: "Email and password are required" }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user || !(await verifyUserPassword(password, user))) {
      return NextResponse.json({ detail: "Invalid email or password" }, { status: 401 });
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
      name: user.full_name,
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
      user: safeUser,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Internal server error" }, { status: 500 });
  }
}
