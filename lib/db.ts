/**
 * Data layer (Neon Postgres, HTTP driver).
 *
 * The client is created lazily so `next build` and any module that merely
 * imports this file don't require DATABASE_URL to be set. jsonb columns are
 * written as stringified JSON cast to ::jsonb and come back already parsed.
 */
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { env } from "./env";
import type { Offer, PageConfig, WizardAnswers } from "./schemas";

let _sql: NeonQueryFunction<false, false> | null = null;
function sql(): NeonQueryFunction<false, false> {
  if (!_sql) _sql = neon(env.databaseUrl);
  return _sql;
}

export interface GenerationRow {
  slug: string;
  answers: WizardAnswers;
  offer: Offer;
  page_config: PageConfig;
  restyled: boolean;
  created_at: string;
}

export async function insertGeneration(input: {
  slug: string;
  answers: WizardAnswers;
  offer: Offer;
  pageConfig: PageConfig;
  ipHash: string;
}): Promise<void> {
  await sql()`
    INSERT INTO generations (slug, answers, offer, page_config, ip_hash)
    VALUES (
      ${input.slug},
      ${JSON.stringify(input.answers)}::jsonb,
      ${JSON.stringify(input.offer)}::jsonb,
      ${JSON.stringify(input.pageConfig)}::jsonb,
      ${input.ipHash}
    )
  `;
}

export async function getBySlug(slug: string): Promise<GenerationRow | null> {
  const rows = (await sql()`
    SELECT slug, answers, offer, page_config, restyled, created_at
    FROM generations
    WHERE slug = ${slug}
    LIMIT 1
  `) as GenerationRow[];
  return rows[0] ?? null;
}

export async function countByIpHash24h(ipHash: string): Promise<number> {
  const rows = (await sql()`
    SELECT count(*)::int AS count
    FROM generations
    WHERE ip_hash = ${ipHash}
      AND created_at > now() - interval '24 hours'
  `) as { count: number }[];
  return rows[0]?.count ?? 0;
}

/** Restyle: replace page_config and flip the one-shot restyled flag. */
export async function applyRestyle(
  slug: string,
  pageConfig: PageConfig,
): Promise<void> {
  await sql()`
    UPDATE generations
    SET page_config = ${JSON.stringify(pageConfig)}::jsonb,
        restyled = TRUE
    WHERE slug = ${slug}
  `;
}
