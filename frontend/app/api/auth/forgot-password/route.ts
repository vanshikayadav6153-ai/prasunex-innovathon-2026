import { NextRequest, NextResponse } from "next/server";
import { findUserByEmail } from "@/lib/server-data";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json({ detail: "Email is required." }, { status: 400 });
    }

    const user = await findUserByEmail(email);
    if (!user) {
      return NextResponse.json({ detail: "User with this email not found." }, { status: 404 });
    }

    const resetToken = `tok-rst-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    return NextResponse.json({
      message: `Password reset instructions dispatched to ${email}.`,
      reset_token: resetToken,
      expires_in_minutes: 15,
    });
  } catch (err: any) {
    return NextResponse.json({ detail: err.message || "Failed to process request" }, { status: 500 });
  }
}
