"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { WizardAnswers } from "@/lib/schemas";
import GenerationStatus from "./GenerationStatus";
import { MIN_ANSWER, MAX_ANSWER } from "@/lib/validation";

const FIXED_QUESTIONS = [
  "What do you sell? Describe your product or service.",
  "Who is it for? Describe your ideal customer.",
  "What result or transformation do they get from you?",
  "What do you charge today — or what would you like to charge?",
];

const DEFAULT_Q5 =
  "What makes you genuinely different from the alternatives your customer is considering?";

type Phase = "asking" | "clarifying" | "contact" | "generating" | "error";

type Qa = { question: string; answer: string };

export default function Wizard() {
  const [qa, setQa] = useState<Qa[]>([]);
  const [adaptiveQuestion, setAdaptiveQuestion] = useState<string | null>(null);
  const [phase, setPhase] = useState<Phase>("asking");
  const [input, setInput] = useState("");
  const [inputError, setInputError] = useState<string | null>(null);
  const [contactLink, setContactLink] = useState("");
  const [genError, setGenError] = useState<string | null>(null);
  const [genAttempt, setGenAttempt] = useState(0);

  const answers: WizardAnswers = useMemo(
    () => ({ qa, contactLink: contactLink.trim() || undefined }),
    [qa, contactLink],
  );

  const currentQuestion = qa.length < 4 ? FIXED_QUESTIONS[qa.length] : adaptiveQuestion;
  const totalSteps = 5;
  const stepNumber = Math.min(qa.length + 1, totalSteps);

  async function fetchClarify(currentQa: Qa[]) {
    setPhase("clarifying");
    try {
      const res = await fetch("/api/clarify", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ qa: currentQa }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        question?: string;
      };
      setAdaptiveQuestion(res.ok && data.question ? data.question : DEFAULT_Q5);
    } catch {
      setAdaptiveQuestion(DEFAULT_Q5);
    }
    setPhase("asking");
  }

  function submitAnswer() {
    const value = input.trim();
    if (value.length < MIN_ANSWER) {
      setInputError("A little more detail, please — one word won't cut it.");
      return;
    }
    if (value.length > MAX_ANSWER) {
      setInputError(`Please keep it under ${MAX_ANSWER} characters.`);
      return;
    }
    const q = currentQuestion;
    if (!q) return;

    const nextQa = [...qa, { question: q, answer: value }];
    setQa(nextQa);
    setInput("");
    setInputError(null);

    if (nextQa.length === 4) {
      void fetchClarify(nextQa);
    } else if (nextQa.length === 5) {
      setPhase("contact");
    }
  }

  function startGeneration() {
    setGenError(null);
    setGenAttempt((n) => n + 1);
    setPhase("generating");
  }

  /* ---------------------------------------------------------- Generating */

  if (phase === "generating") {
    return (
      <GenerationStatus
        key={genAttempt}
        answers={answers}
        onError={(message) => {
          setGenError(message);
          setPhase("error");
        }}
      />
    );
  }

  /* -------------------------------------------------------------- Error */

  if (phase === "error") {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-6 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-accent">
          Something broke
        </p>
        <p className="max-w-sm text-lg text-foreground/80">{genError}</p>
        <div className="flex gap-4">
          <button
            onClick={startGeneration}
            className="rounded-full bg-accent px-8 py-3 text-sm font-medium uppercase tracking-wide text-background transition-transform hover:-translate-y-0.5"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-full border border-muted/40 px-8 py-3 text-sm uppercase tracking-wide text-muted transition-colors hover:border-muted"
          >
            Start over
          </Link>
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------- Contact */

  if (phase === "contact") {
    return (
      <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col justify-center px-6">
        <Transcript qa={qa} />
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Last one — optional
        </p>
        <h2 className="mt-4 font-serif text-3xl leading-snug sm:text-4xl">
          Where should the landing page&apos;s buttons send people?
        </h2>
        <p className="mt-3 text-foreground/70">
          Your site, Instagram, Calendly, or an email. Leave it blank to decide
          later.
        </p>
        <input
          type="text"
          value={contactLink}
          onChange={(e) => setContactLink(e.target.value)}
          placeholder="https://cal.com/you  ·  @yourhandle  ·  you@email.com"
          className="mt-6 w-full rounded-lg border border-muted/30 bg-transparent px-4 py-3 text-lg outline-none focus:border-accent"
        />
        <div className="mt-6 flex gap-4">
          <button
            onClick={startGeneration}
            className="rounded-full bg-accent px-8 py-3 text-sm font-medium uppercase tracking-wide text-background transition-transform hover:-translate-y-0.5"
          >
            Build my offer
          </button>
          <button
            onClick={() => {
              setContactLink("");
              startGeneration();
            }}
            className="text-sm text-muted underline underline-offset-4 transition-opacity hover:opacity-60"
          >
            Skip
          </button>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------- Asking / clarifying */

  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-xl flex-col justify-center px-6 py-12">
      <Transcript qa={qa} />

      <p className="text-xs uppercase tracking-[0.2em] text-muted">
        Question {stepNumber} of {totalSteps}
      </p>

      {phase === "clarifying" ? (
        <p className="mt-4 flex items-center gap-3 font-serif text-2xl text-foreground/60">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
          Thinking of the right question for you…
        </p>
      ) : (
        <>
          <h2 className="mt-4 font-serif text-3xl leading-snug sm:text-4xl">
            {currentQuestion}
          </h2>
          <textarea
            autoFocus
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submitAnswer();
            }}
            rows={3}
            maxLength={MAX_ANSWER + 40}
            placeholder="Type your answer…"
            className="mt-6 w-full resize-none rounded-lg border border-muted/30 bg-transparent px-4 py-3 text-lg outline-none focus:border-accent"
          />
          {inputError && (
            <p className="mt-2 text-sm text-accent">{inputError}</p>
          )}
          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={submitAnswer}
              className="rounded-full bg-accent px-8 py-3 text-sm font-medium uppercase tracking-wide text-background transition-transform hover:-translate-y-0.5"
            >
              {qa.length >= 4 ? "Finish" : "Next"}
            </button>
            <span className="text-xs text-muted">⌘/Ctrl + Enter</span>
          </div>
        </>
      )}
    </div>
  );
}

function Transcript({ qa }: { qa: Qa[] }) {
  if (qa.length === 0) return null;
  return (
    <ul className="mb-8 space-y-3 border-l-2 border-muted/20 pl-4">
      {qa.map((item, i) => (
        <li key={i} className="text-sm">
          <span className="text-muted">{item.question}</span>
          <br />
          <span className="text-foreground/80">{item.answer}</span>
        </li>
      ))}
    </ul>
  );
}
