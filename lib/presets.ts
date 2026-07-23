/**
 * Design presets. The Art Director may ONLY pick a palette_id / font_pair_id
 * from these lists — it never invents colors or fonts. Font family names must
 * match fonts we statically import via next/font in the template layer
 * (Phase 3), so keep them to well-known Google Fonts.
 *
 * Phase 1 ships the `editorial` template's presets. `bold` and `craft` are
 * added in Phase 7.
 */
import type { PageConfig, TemplateId } from "./schemas";

export interface Palette {
  id: string;
  name: string;
  bg: string; // page background
  ink: string; // primary text
  accent: string; // accent / CTA
  muted: string; // secondary text / borders
}

export interface FontPair {
  id: string;
  name: string;
  display: string; // Google Font family for headings
  body: string; // Google Font family for body
}

export interface TemplatePresets {
  palettes: Palette[];
  fontPairs: FontPair[];
}

export const PRESETS: Partial<Record<TemplateId, TemplatePresets>> = {
  editorial: {
    palettes: [
      {
        id: "ed-cream-terracotta",
        name: "Cream & Terracotta",
        bg: "#F4F1EA",
        ink: "#1A1712",
        accent: "#C2571A",
        muted: "#6B6459",
      },
      {
        id: "ed-paper-navy",
        name: "Paper & Navy",
        bg: "#FBFAF7",
        ink: "#14213D",
        accent: "#B0764A",
        muted: "#5B6472",
      },
      {
        id: "ed-bone-forest",
        name: "Bone & Forest",
        bg: "#EFEAE0",
        ink: "#1F2421",
        accent: "#55735A",
        muted: "#6C6A61",
      },
    ],
    fontPairs: [
      {
        id: "ed-fraunces-newsreader",
        name: "Fraunces / Newsreader",
        display: "Fraunces",
        body: "Newsreader",
      },
      {
        id: "ed-playfair-source",
        name: "Playfair Display / Source Serif 4",
        display: "Playfair Display",
        body: "Source Serif 4",
      },
      {
        id: "ed-libre-work",
        name: "Libre Baskerville / Work Sans",
        display: "Libre Baskerville",
        body: "Work Sans",
      },
    ],
  },
};

export function availableTemplateIds(): TemplateId[] {
  return Object.keys(PRESETS) as TemplateId[];
}

export function getPresets(template: TemplateId): TemplatePresets | undefined {
  return PRESETS[template];
}

export function resolvePalette(pc: PageConfig): Palette | undefined {
  return PRESETS[pc.template]?.palettes.find((p) => p.id === pc.palette_id);
}

export function resolveFontPair(pc: PageConfig): FontPair | undefined {
  return PRESETS[pc.template]?.fontPairs.find((f) => f.id === pc.font_pair_id);
}

/**
 * Validate that a generated PageConfig references a real template + preset.
 * Throws on mismatch so the structured-generation retry loop can correct it.
 */
export function assertValidPresets(pc: PageConfig): PageConfig {
  const presets = PRESETS[pc.template];
  if (!presets) {
    throw new Error(
      `template "${pc.template}" is not available yet. Use one of: ${availableTemplateIds().join(", ")}`,
    );
  }
  if (!presets.palettes.some((p) => p.id === pc.palette_id)) {
    throw new Error(
      `palette_id "${pc.palette_id}" is invalid for template "${pc.template}". Valid: ${presets.palettes.map((p) => p.id).join(", ")}`,
    );
  }
  if (!presets.fontPairs.some((f) => f.id === pc.font_pair_id)) {
    throw new Error(
      `font_pair_id "${pc.font_pair_id}" is invalid for template "${pc.template}". Valid: ${presets.fontPairs.map((f) => f.id).join(", ")}`,
    );
  }
  return pc;
}
