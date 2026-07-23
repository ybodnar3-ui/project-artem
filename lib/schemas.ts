/**
 * Zod schemas for the two Claude outputs, plus JSON Schemas derived from them
 * for `output_config.format` (structured outputs).
 *
 * Design notes:
 * - Every field is required (no optionals) and no string/array length
 *   constraints are used. This keeps the derived JSON Schema inside the subset
 *   structured outputs supports (no minLength/maxItems/etc.), so the model is
 *   constrained to the exact shape and we never hit a 400 for unsupported
 *   keywords. Cardinality guidance ("3-6 items") lives in the prompts instead.
 * - Zod remains the runtime validator; the derived JSON Schema is only the
 *   generation constraint.
 */
import { z } from "zod";

/* ------------------------------------------------------------------ Offer */

const ValueStackItem = z.object({
  problem: z.string(),
  solution: z.string(),
  value_label: z.string(), // e.g. "$1,200 value"
});

const Bonus = z.object({
  name: z.string(),
  description: z.string(),
  value_label: z.string(),
});

export const OfferSchema = z.object({
  offer_name: z.string(), // MAGIC-formula name
  dream_outcome: z.string(),
  value_stack: z.array(ValueStackItem), // problems -> solutions
  bonuses: z.array(Bonus),
  guarantee: z.object({ name: z.string(), statement: z.string() }),
  pricing: z.object({
    anchor: z.string(), // what it would normally cost / total stack value
    price: z.string(), // the actual price
    framing: z.string(), // how the price is justified
  }),
  scarcity: z.string(),
  urgency: z.string(),
  language: z.string(), // language the offer is written in, e.g. "en"
});

export type Offer = z.infer<typeof OfferSchema>;

/* ------------------------------------------------------------- Page config */

const HowStep = z.object({
  step: z.string(), // "01"
  title: z.string(),
  description: z.string(),
});

const Sections = z.object({
  hero: z.object({
    headline: z.string(),
    subheadline: z.string(),
    cta: z.string(),
  }),
  problem: z.object({ heading: z.string(), body: z.string() }),
  value_stack: z.array(z.object({ title: z.string(), description: z.string() })),
  how_it_works: z.array(HowStep),
  guarantee: z.object({ heading: z.string(), body: z.string() }),
  pricing: z.object({
    heading: z.string(),
    price: z.string(),
    note: z.string(),
    cta: z.string(),
  }),
  faq: z.array(z.object({ q: z.string(), a: z.string() })),
  final_cta: z.object({
    heading: z.string(),
    subheading: z.string(),
    cta: z.string(),
  }),
});

export const TEMPLATE_IDS = ["editorial", "bold", "craft"] as const;
export type TemplateId = (typeof TEMPLATE_IDS)[number];

export const PageConfigSchema = z.object({
  template: z.enum(TEMPLATE_IDS),
  palette_id: z.string(),
  font_pair_id: z.string(),
  sections: Sections,
});

export type PageConfig = z.infer<typeof PageConfigSchema>;

/* ------------------------------------------------------ Wizard answers */

export interface WizardAnswers {
  qa: { question: string; answer: string }[];
  contactLink?: string;
}

/* ------------------------------------------------ JSON Schema derivation */

type JsonNode = Record<string, unknown> | unknown[] | unknown;

/**
 * Force every object node to `additionalProperties: false` with all keys
 * required — the shape structured outputs' strict mode expects — recursing
 * through `properties`, `items`, `anyOf`, and `$defs`.
 */
function makeStrict(node: JsonNode): JsonNode {
  if (Array.isArray(node)) return node.map(makeStrict);
  if (node && typeof node === "object") {
    const src = node as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(src)) out[k] = makeStrict(v);
    if (out.type === "object" && out.properties) {
      out.additionalProperties = false;
      out.required = Object.keys(out.properties as Record<string, unknown>);
    }
    return out;
  }
  return node;
}

function toStructuredJsonSchema(schema: z.ZodType): Record<string, unknown> {
  const raw = z.toJSONSchema(schema) as Record<string, unknown>;
  delete raw.$schema;
  return makeStrict(raw) as Record<string, unknown>;
}

export const offerJsonSchema = toStructuredJsonSchema(OfferSchema);
export const pageConfigJsonSchema = toStructuredJsonSchema(PageConfigSchema);
