import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";

export async function POST(req: NextRequest) {
  const backendRes = await proxyToBackend(req, "/api/auth/refresh");
  if (backendRes.ok) {
    try {
      const data = await backendRes.clone().json();
      if (data.access_token) {
        backendRes.cookies.set("nexus_token", data.access_token, {
          path: "/",
          maxAge: 7 * 24 * 3600,
          sameSite: "lax",
          httpOnly: false,
        });
      }
      if (data.refresh_token) {
        backendRes.cookies.set("nexus_refresh_token", data.refresh_token, {
          path: "/",
          maxAge: 14 * 24 * 3600,
          sameSite: "lax",
          httpOnly: true,
        });
      }
    } catch {
      // Fallback
    }
  }
  return backendRes;
}
