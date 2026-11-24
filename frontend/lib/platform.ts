export type Readiness = {
  ready: boolean;
  database: string;
  capabilities: Record<string, boolean>;
};
import { apiRequest } from "./api-client";
export async function getReadiness(base: string): Promise<Readiness> {
  try {
    const data: unknown = await apiRequest<Readiness>(
      "/api/v1/ready",
      { cache: "no-store" },
      2500,
    );
    if (
      !data ||
      typeof data !== "object" ||
      !("ready" in data) ||
      typeof data.ready !== "boolean" ||
      !("database" in data) ||
      typeof data.database !== "string" ||
      !("capabilities" in data) ||
      !data.capabilities ||
      typeof data.capabilities !== "object" ||
      !Object.values(data.capabilities).every((v) => typeof v === "boolean")
    )
      throw new Error("Invalid service response");
    return data as Readiness;
  } catch {
    throw new Error("Campus API is unavailable");
  }
}
