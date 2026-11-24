import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/api-proxy";

export async function GET(req: NextRequest) {
  return proxyToBackend(req, "/api/micro-drills/history");
}
