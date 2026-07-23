/**
 * Anthropic client + structured-generation wrapper.
 *
 * The SDK already retries 429/5xx/529 (overloaded) with backoff by default
 * (max_retries = 2), so this wrapper only adds the schema-validation retry the
 * spec calls for: one automatic retry that feeds the validation error back to
 * the model, then a hard failure the caller surfaces to the user.
 */
import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env";

export const MODEL = "claude-sonnet-5";

let _client: Anthropic | null = null;
export function anthropic(): Anthropic {
  if (!_client) _client = new Anthropic({ apiKey: env.anthropicApiKey });
  return _client;
}

function firstText(message: Anthropic.Message): string {
  const block = message.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  return block?.text ?? "";
}

/** Plain-text completion (used by /api/clarify for the adaptive 5th question). */
export async function generateText(opts: {
  system: string;
  user: string;
  maxTokens?: number;
}): Promise<string> {
  const message = await anthropic().messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens ?? 512,
    thinking: { type: "disabled" },
    system: opts.system,
    messages: [{ role: "user", content: opts.user }],
  });
  return firstText(message).trim();
}

/**
 * Structured JSON generation constrained by a JSON Schema, validated by a Zod
 * parser. On validation failure it retries once with the error fed back.
 */
export async function generateStructured<T>(opts: {
  system: string;
  user: string;
  jsonSchema: Record<string, unknown>;
  validate: (data: unknown) => T; // throws on invalid
  maxTokens?: number;
}): Promise<T> {
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: opts.user },
  ];
  let lastError: unknown;

  for (let attempt = 0; attempt < 2; attempt++) {
    const message = await anthropic().messages.create({
      model: MODEL,
      max_tokens: opts.maxTokens ?? 4096,
      thinking: { type: "disabled" },
      system: opts.system,
      output_config: {
        format: { type: "json_schema", schema: opts.jsonSchema },
      },
      messages,
    });

    const text = firstText(message);
    try {
      const parsed: unknown = JSON.parse(text);
      return opts.validate(parsed);
    } catch (error) {
      lastError = error;
      // Multi-turn correction (not a last-assistant prefill — a user turn
      // follows, which Sonnet 5 accepts).
      messages.push({ role: "assistant", content: text });
      messages.push({
        role: "user",
        content:
          "Your previous response did not satisfy the required schema. " +
          `Error: ${error instanceof Error ? error.message : String(error)}. ` +
          "Return corrected JSON that strictly matches the schema. Output JSON only.",
      });
    }
  }

  throw new Error(
    `Structured generation failed after retry: ${
      lastError instanceof Error ? lastError.message : String(lastError)
    }`,
  );
}
