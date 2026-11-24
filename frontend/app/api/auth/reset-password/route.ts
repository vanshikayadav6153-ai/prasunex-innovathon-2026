import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { findUserByEmail, updateUserPassword } from "@/lib/server-data";

export async function POST(req: NextRequest) {
  try {
    const { email, new_password, token } = await req.json();

    if (!email || !new_password) {
      return NextResponse.json({ detail: "Email and new password are required." }, { status: 400 });
    }

    if (new_password.length < 6) {
      return NextResponse.json({ detail: "Password must be at least 6 characters long." }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ detail: "User with this email not found." }, { status: 404 });
    }

    const updated = await updateUserPassword(email, await bcrypt.hash(new_password, 10));
    if (!updated) {
      return NextResponse.json({ detail: "Password reset is unavailable for this account." }, { status: 404 });
    }
    return NextResponse.json({
      success: true,
      message: "Password has been successfully updated. You may now sign in.",
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to reset password" }, { status: 500 });
  }
}
