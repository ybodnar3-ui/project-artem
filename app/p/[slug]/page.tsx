import { cache } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getBySlug, type GenerationRow } from "@/lib/db";
import { SAMPLE_GENERATION, DEMO_SLUG } from "@/lib/sample";
import { resolvePalette, getPresets } from "@/lib/presets";
import { TEMPLATES } from "@/components/templates";
import { env } from "@/lib/env";

// Public landings are rendered on demand (DB-backed).
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

// Deduped across generateMetadata + the page render for the same request.
const load = cache(async (slug: string): Promise<GenerationRow | null> => {
  if (slug === DEMO_SLUG) return SAMPLE_GENERATION;
  try {
    return await getBySlug(slug);
  } catch {
    // DB not configured / unreachable — treat as not found rather than 500.
    return null;
  }
});

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const gen = await load(slug);
  if (!gen) return { title: "Not found — Offer Machine" };
  const hero = gen.page_config.sections.hero;
  return {
    title: hero.headline,
    description: hero.subheadline,
    openGraph: { title: hero.headline, description: hero.subheadline },
  };
}

export default async function PublicPage({ params }: Params) {
  const { slug } = await params;
  const gen = await load(slug);
  if (!gen) notFound();

  const config = gen.page_config;
  const Template = TEMPLATES[config.template];
  if (!Template) notFound();

  const palette =
    resolvePalette(config) ?? getPresets(config.template)?.palettes[0];
  if (!palette) notFound();

  return (
    <Template
      config={config}
      palette={palette}
      contactLink={gen.answers.contactLink}
      baseUrl={env.baseUrl}
    />
  );
}
