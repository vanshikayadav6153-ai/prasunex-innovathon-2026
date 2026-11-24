import { NextRequest, NextResponse } from "next/server";

export const BACKEND_INTERNAL_URL =
  process.env.API_INTERNAL_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://127.0.0.1:8000";

/**
 * Standard proxy helper that forwards Next.js API requests to the real FastAPI backend.
 * Automatically injects the nexus_token from cookies as a Bearer authorization header if not provided.
 */
export async function proxyToBackend(
  req: NextRequest,
  backendPath: string,
  extraHeaders: Record<string, string> = {}
) {
  const url = new URL(req.url);
  const targetUrl = `${BACKEND_INTERNAL_URL}${backendPath}${url.search}`;

  const headers = new Headers();
  req.headers.forEach((value, key) => {
    const k = key.toLowerCase();
    if (!["host", "connection", "content-length", "expect", "transfer-encoding"].includes(k)) {
      headers.set(key, value);
    }
  });

  // Inject token from cookie if no Authorization header present
  if (!headers.has("authorization")) {
    const token = req.cookies.get("nexus_token")?.value;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
  }

  Object.entries(extraHeaders).forEach(([k, v]) => {
    headers.set(k, v);
  });

  let body: any = undefined;
  if (!["GET", "HEAD"].includes(req.method)) {
    try {
      const textBody = await req.clone().text();
      if (textBody && textBody.length > 0) {
        body = textBody;
        if (!headers.has("content-type")) {
          headers.set("content-type", "application/json");
        }
      }
    } catch {
      // no body
    }
  }

  try {
    const res = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const resHeaders = new Headers();
    res.headers.forEach((val, key) => {
      const k = key.toLowerCase();
      if (!["content-encoding", "content-length"].includes(k)) {
        resHeaders.set(key, val);
      }
    });

    const data = await res.arrayBuffer();
    return new NextResponse(data, {
      status: res.status,
      statusText: res.statusText,
      headers: resHeaders,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        detail: `FastAPI backend communication error: ${err.message}`,
        cause: String(err.cause || ""),
      },
      { status: 502 }
    );
  }
}
