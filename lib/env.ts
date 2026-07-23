/**
 * Typed, fail-fast access to environment variables.
 *
 * Server-only secrets are read lazily via getters so that a missing value
 * throws at the point of use (a DB/LLM call) with a clear message, rather than
 * silently producing `undefined`. This keeps `next build` green even before
 * Neon/keys are provisioned, while making runtime misconfiguration obvious.
 */

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Set it in .env.local (see .env.example).`,
    );
  }
  return value;
}

export const env = {
  get anthropicApiKey(): string {
    return required("ANTHROPIC_API_KEY");
  },
  get databaseUrl(): string {
    return required("DATABASE_URL");
  },
  get ipSalt(): string {
    return required("IP_SALT");
  },
  /** Public base URL — safe fallback for local dev. */
  get baseUrl(): string {
    return process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000";
  },
} as const;
