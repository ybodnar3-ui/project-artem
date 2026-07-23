/**
 * IP hashing + extraction for rate limiting.
 * ip_hash = sha256(ip + IP_SALT). We never store raw IPs.
 */
import { createHash } from "node:crypto";
import { env } from "./env";

/** Extract the client IP from proxy headers (Vercel sits behind a proxy). */
export function getClientIp(headers: Headers): string {
  const forwarded = headers.get("x-forwarded-for");
  if (forwarded) {
    // First entry is the original client.
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  return headers.get("x-real-ip")?.trim() || "0.0.0.0";
}

export function hashIp(ip: string): string {
  return createHash("sha256")
    .update(ip + env.ipSalt)
    .digest("hex");
}

export const DAILY_LIMIT = 3;
