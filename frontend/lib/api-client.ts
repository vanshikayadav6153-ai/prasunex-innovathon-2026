export type ApiErrorBody = {
  error?: {
    code?: string;
    message?: string;
    capability?: string;
    prerequisite?: string;
  };
  detail?: string;
};

export class ApiClientError extends Error {
  readonly status: number;
  readonly code: string;
  readonly details: ApiErrorBody | null;

  constructor(
    status: number,
    message: string,
    code = "api_error",
    details: ApiErrorBody | null = null,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

const apiBase = () =>
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(
    /\/$/,
    "",
  );

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  timeoutMs = 5000,
): Promise<T> {
  const method = (options.method || "GET").toUpperCase();
  const retryable = ["GET", "HEAD", "OPTIONS"].includes(method);
  let lastError: unknown;

  for (let attempt = 0; attempt < (retryable ? 2 : 1); attempt += 1) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(
        `${apiBase()}${path.startsWith("/") ? path : `/${path}`}`,
        {
          ...options,
          signal: controller.signal,
          headers: { Accept: "application/json", ...options.headers },
        },
      );
      const raw = await response.text();
      let body: ApiErrorBody | T | null = null;
      if (raw) {
        try {
          body = JSON.parse(raw) as ApiErrorBody | T;
        } catch {
          body = null;
        }
      }
      if (!response.ok) {
        const details = (
          body && typeof body === "object" ? body : null
        ) as ApiErrorBody | null;
        const error = details?.error;
        throw new ApiClientError(
          response.status,
          error?.message ||
            details?.detail ||
            `Request failed (${response.status})`,
          error?.code,
          details,
        );
      }
      return (body ?? {}) as T;
    } catch (error) {
      lastError = error;
      if (error instanceof ApiClientError || attempt === (retryable ? 1 : 0))
        throw error;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastError instanceof Error
    ? lastError
    : new ApiClientError(0, "Campus API is unavailable", "network_error");
}
