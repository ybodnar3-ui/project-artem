import { nanoid } from "nanoid";
import { anthropic, MODEL, generateStructured } from "@/lib/anthropic";
import {
  OfferSchema,
  PageConfigSchema,
  offerJsonSchema,
  pageConfigJsonSchema,
  type Offer,
  type PageConfig,
  type WizardAnswers,
} from "@/lib/schemas";
import { assertValidPresets } from "@/lib/presets";
import {
  OFFER_ENGINEER_SYSTEM,
  buildOfferUserMessage,
} from "@/lib/prompts/offer-engineer";
import {
  buildArtDirectorSystem,
  buildArtDirectorUserMessage,
} from "@/lib/prompts/art-director";
import { insertGeneration } from "@/lib/db";
import { getClientIp, hashIp, DAILY_LIMIT } from "@/lib/ratelimit";
import { countByIpHash24h } from "@/lib/db";
import { validateAnswers } from "@/lib/validation";
import { sseChunk, SSE_HEADERS, type SseMessage } from "@/lib/sse";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Send = (message: SseMessage) => void;

/** Call 1 — streamed so we can emit honest progress as offer keys appear. */
async function runOfferEngineer(
  answers: WizardAnswers,
  send: Send,
): Promise<Offer> {
  const system = OFFER_ENGINEER_SYSTEM;
  const user = buildOfferUserMessage(answers);

  const stages = [
    { key: '"value_stack"', stage: "crafting", label: "Crafting your value equation" },
    { key: '"guarantee"', stage: "guarantee", label: "Engineering the guarantee" },
    { key: '"offer_name"', stage: "naming", label: "Naming your offer" },
  ];
  let idx = 0;
  const advance = (acc: string) => {
    while (idx < stages.length && acc.includes(stages[idx].key)) {
      send({ type: "status", stage: stages[idx].stage, label: stages[idx].label });
      idx++;
    }
  };

  try {
    let acc = "";
    const stream = anthropic().messages.stream({
      model: MODEL,
      max_tokens: 4096,
      thinking: { type: "disabled" },
      system,
      output_config: { format: { type: "json_schema", schema: offerJsonSchema } },
      messages: [{ role: "user", content: user }],
    });

    for await (const event of stream) {
      if (event.type === "content_block_delta") {
        const delta = event.delta;
        if (delta.type === "text_delta") {
          acc += delta.text;
          advance(acc);
        }
      }
    }

    const final = await stream.finalMessage();
    const text =
      final.content.find((b) => b.type === "text")?.text ?? acc;
    return OfferSchema.parse(JSON.parse(text));
  } catch {
    // Streaming path failed (network or schema) — flush remaining stages so the
    // UI stays coherent, then fall back to the non-streaming wrapper (own retry).
    advance('"value_stack""guarantee""offer_name"');
    return generateStructured({
      system,
      user,
      jsonSchema: offerJsonSchema,
      validate: (d) => OfferSchema.parse(d),
    });
  }
}

/** Call 2 — Art Director. Non-streaming; validated against presets. */
async function runArtDirector(
  offer: Offer,
  niche: string,
): Promise<PageConfig> {
  return generateStructured({
    system: buildArtDirectorSystem(),
    user: buildArtDirectorUserMessage(offer, niche),
    jsonSchema: pageConfigJsonSchema,
    validate: (d) => assertValidPresets(PageConfigSchema.parse(d)),
  });
}

export async function POST(req: Request): Promise<Response> {
  let body: { qa?: { question: string; answer: string }[]; contactLink?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const answers: WizardAnswers = {
    qa: body.qa ?? [],
    contactLink: body.contactLink,
  };

  // Validate BEFORE touching DB/LLM so junk input is cheap and never counts.
  const valid = validateAnswers(answers);
  if (!valid.ok) {
    return Response.json(
      { error: "invalid_input", message: valid.message, index: valid.index },
      { status: 400 },
    );
  }

  // Rate limit (also the point where missing storage config surfaces).
  let ipHash = "";
  let used = 0;
  try {
    ipHash = hashIp(getClientIp(req.headers));
    used = await countByIpHash24h(ipHash);
  } catch {
    return Response.json(
      { error: "server_error", message: "Storage is not configured yet." },
      { status: 503 },
    );
  }
  if (used >= DAILY_LIMIT) {
    return Response.json(
      {
        error: "rate_limited",
        message:
          "You've used your 3 free offers today — come back tomorrow.",
      },
      { status: 429 },
    );
  }

  const niche = answers.qa
    .slice(0, 2)
    .map((x) => x.answer)
    .join(" — ");

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send: Send = (m) =>
        controller.enqueue(encoder.encode(sseChunk(m)));
      try {
        send({ type: "status", stage: "analyzing", label: "Analyzing your business" });
        const offer = await runOfferEngineer(answers, send);

        send({ type: "status", stage: "designing", label: "Designing your page" });
        const pageConfig = await runArtDirector(offer, niche);

        // Persist only on success — so failures never consume the daily limit.
        const slug = nanoid(8);
        await insertGeneration({ slug, answers, offer, pageConfig, ipHash });

        send({ type: "done", slug });
      } catch {
        send({
          type: "error",
          code: "generation_failed",
          message:
            "Something broke while generating. Please try again — this didn't count against your limit.",
        });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, { headers: SSE_HEADERS });
}
