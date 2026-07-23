import { generateText } from "@/lib/anthropic";
import { validateQa } from "@/lib/validation";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CLARIFY_SYSTEM = `You are onboarding a founder to build them a high-converting offer. You have their first answers about their business. Ask ONE sharp follow-up question that will most improve the offer — usually about what genuinely differentiates them (their unique mechanism), who the offer is NOT for, or the single biggest objection buyers raise.

Rules:
- Return ONLY the question text. No preamble, no quotes, no numbering.
- One sentence, concrete and specific to their business.
- Ask in the SAME LANGUAGE the founder used in their answers.`;

export async function POST(req: Request): Promise<Response> {
  let body: { qa?: { question: string; answer: string }[] };
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: "invalid_json" }, { status: 400 });
  }

  const qa = body.qa ?? [];
  const valid = validateQa(qa);
  if (!valid.ok) {
    return Response.json(
      { error: "invalid_input", message: valid.message, index: valid.index },
      { status: 400 },
    );
  }

  const user =
    "The founder's answers so far:\n\n" +
    qa
      .map((x, i) => `Q${i + 1}: ${x.question}\nA${i + 1}: ${x.answer}`)
      .join("\n\n") +
    "\n\nAsk the single best follow-up question.";

  try {
    const question = await generateText({ system: CLARIFY_SYSTEM, user });
    return Response.json({ question });
  } catch {
    // Non-fatal: the wizard can fall back to a default 5th question.
    return Response.json({ error: "generation_failed" }, { status: 502 });
  }
}
