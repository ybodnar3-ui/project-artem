/**
 * Call 2 — Art Director.
 * Given the Offer JSON + business niche, choose a template + palette + font
 * pair FROM THE PRESETS ONLY, and write every section's copy. Never generates
 * HTML/CSS.
 */
import type { Offer } from "../schemas";
import { availableTemplateIds, getPresets } from "../presets";

const TEMPLATE_GUIDE: Record<string, string> = {
  editorial:
    "Editorial — refined typographic, magazine-like, lots of whitespace. Fits consulting, education, premium services, B2B.",
  bold: "Bold — dark, cinematic, big numbers, high contrast. Fits fitness, coaching, aggressive offers.",
  craft:
    "Craft — warm, textured, soft shapes. Fits products, local business, hand-made.",
};

function renderPresetCatalog(): string {
  return availableTemplateIds()
    .map((tid) => {
      const p = getPresets(tid)!;
      const palettes = p.palettes
        .map((pl) => `      - ${pl.id} (${pl.name})`)
        .join("\n");
      const fonts = p.fontPairs
        .map((f) => `      - ${f.id} (${f.name})`)
        .join("\n");
      return `  template "${tid}": ${TEMPLATE_GUIDE[tid] ?? ""}\n    palette_id options:\n${palettes}\n    font_pair_id options:\n${fonts}`;
    })
    .join("\n\n");
}

export function buildArtDirectorSystem(): string {
  return `You are a senior art director and conversion copywriter. You are given a finished offer and must produce the CONTENT and DESIGN CHOICES for a premium landing page. You never write HTML or CSS — a hand-built template renders your JSON.

AVAILABLE TEMPLATES AND PRESETS (you may ONLY choose ids from these lists):

${renderPresetCatalog()}

YOUR JOB:
1. Pick the single template whose personality best fits the offer's niche and tone.
2. Pick one palette_id and one font_pair_id that belong to that template.
3. Write compelling, specific copy for EVERY section. Match the offer — reuse its dream outcome, value stack, guarantee, pricing framing, scarcity and urgency. Turn the value_stack into benefit-led copy; turn objections into FAQ answers.

COPY RULES:
- Write in the SAME LANGUAGE as the offer.
- Editorial, human, specific. No generic AI filler, no "unlock your potential" cliché.
- hero.headline: sharp and outcome-driven. hero.cta / pricing.cta / final_cta.cta: short action verbs.
- value_stack: 3–6 items. how_it_works: 3–4 steps (step = "01".."04"). faq: 3–6 real objections answered.
- pricing.price should reflect the offer's price and framing.
- Never invent a palette or font that isn't in the lists above.
- Output must strictly match the provided JSON schema. JSON only, no commentary.`;
}

export function buildArtDirectorUserMessage(offer: Offer, niche: string): string {
  return `Business niche / context: ${niche}

Offer JSON:
${JSON.stringify(offer, null, 2)}

Produce the page config JSON (template, palette_id, font_pair_id, and all section copy) matching the schema.`;
}
