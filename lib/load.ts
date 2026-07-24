import { cache } from "react";
import { getBySlug, type GenerationRow } from "./db";
import { SAMPLE_GENERATION, DEMO_SLUG } from "./sample";

/** Load a generation by slug (demo fixture or DB). Deduped per request.
 *  DB errors (unconfigured/unreachable) resolve to null, not a 500. */
export const loadGeneration = cache(
  async (slug: string): Promise<GenerationRow | null> => {
    if (slug === DEMO_SLUG) return SAMPLE_GENERATION;
    try {
      return await getBySlug(slug);
    } catch {
      return null;
    }
  },
);
