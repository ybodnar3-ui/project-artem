import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadGeneration } from "@/lib/load";
import { resolvePalette, getPresets } from "@/lib/presets";
import { TEMPLATES } from "@/components/templates";
import { env } from "@/lib/env";

// Public landings are rendered on demand (DB-backed).
export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const gen = await loadGeneration(slug);
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
  const gen = await loadGeneration(slug);
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
