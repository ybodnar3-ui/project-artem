/** Wizard input validation (shared by /api/clarify and /api/generate). */
import type { WizardAnswers } from "./schemas";

export const MIN_ANSWER = 10;
export const MAX_ANSWER = 500;
export const MAX_TOTAL = 3000;
export const MAX_CONTACT = 300;

export type ValidationResult =
  | { ok: true }
  | { ok: false; message: string; index?: number };

/** Validate an array of { question, answer } pairs. */
export function validateQa(
  qa: { question: string; answer: string }[],
): ValidationResult {
  if (!Array.isArray(qa) || qa.length === 0) {
    return { ok: false, message: "No answers provided." };
  }
  let total = 0;
  for (let i = 0; i < qa.length; i++) {
    const answer = (qa[i]?.answer ?? "").trim();
    if (answer.length < MIN_ANSWER) {
      return {
        ok: false,
        index: i,
        message:
          "Could you say a little more? A one-word answer isn't enough to build a strong offer.",
      };
    }
    if (answer.length > MAX_ANSWER) {
      return {
        ok: false,
        index: i,
        message: `Please keep each answer under ${MAX_ANSWER} characters.`,
      };
    }
    total += answer.length;
  }
  if (total > MAX_TOTAL) {
    return {
      ok: false,
      message: `Your answers are a bit long — please trim to under ${MAX_TOTAL} characters total.`,
    };
  }
  return { ok: true };
}

/** Full validation for a generate request (answers + optional contact link). */
export function validateAnswers(answers: WizardAnswers): ValidationResult {
  const base = validateQa(answers.qa);
  if (!base.ok) return base;
  if (answers.contactLink && answers.contactLink.length > MAX_CONTACT) {
    return { ok: false, message: "Contact link is too long." };
  }
  return { ok: true };
}
