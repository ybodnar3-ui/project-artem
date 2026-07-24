"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { WizardAnswers } from "@/lib/schemas";

interface StatusLine {
  stage: string;
  label: string;
}

export default function GenerationStatus({
  answers,
  onError,
}: {
  answers: WizardAnswers;
  onError: (message: string) => void;
}) {
  const router = useRouter();
  const [lines, setLines] = useState<StatusLine[]>([]);
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return; // guard React 18 double-invoke
    started.current = true;

    const run = async () => {
      let res: Response;
      try {
        res = await fetch("/api/generate", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(answers),
        });
      } catch {
        onError("Network error — please try again.");
        return;
      }

      if (!res.ok || !res.body) {
        const data = (await res.json().catch(() => ({}))) as {
          message?: string;
        };
        onError(
          data.message ?? "Something went wrong. Please try again.",
        );
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let sep: number;
        while ((sep = buffer.indexOf("\n\n")) >= 0) {
          const rawEvent = buffer.slice(0, sep);
          buffer = buffer.slice(sep + 2);
          const dataLine = rawEvent
            .split("\n")
            .find((l) => l.startsWith("data:"));
          if (!dataLine) continue;

          let msg:
            | { type: "status"; stage: string; label: string }
            | { type: "done"; slug: string }
            | { type: "error"; message: string };
          try {
            msg = JSON.parse(dataLine.slice(5).trim());
          } catch {
            continue;
          }

          if (msg.type === "status") {
            setLines((prev) => [
              ...prev,
              { stage: msg.stage, label: msg.label },
            ]);
          } else if (msg.type === "done") {
            router.push(`/result/${msg.slug}`);
            return;
          } else if (msg.type === "error") {
            onError(msg.message);
            return;
          }
        }
      }
    };

    void run();
  }, [answers, onError, router]);

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6">
      <p className="mb-10 text-xs uppercase tracking-[0.2em] text-accent">
        Building your offer
      </p>
      <ul className="w-full max-w-sm space-y-4">
        {lines.map((line, i) => {
          const isLast = i === lines.length - 1;
          return (
            <li
              key={`${line.stage}-${i}`}
              className="flex items-center gap-3 text-lg"
            >
              <span
                className={
                  isLast
                    ? "inline-block h-2 w-2 animate-pulse rounded-full bg-accent"
                    : "inline-block h-2 w-2 rounded-full bg-accent/40"
                }
              />
              <span
                className={
                  isLast ? "text-foreground" : "text-foreground/50"
                }
              >
                {line.label}
              </span>
            </li>
          );
        })}
        {lines.length === 0 && (
          <li className="flex items-center gap-3 text-lg text-foreground/60">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-accent" />
            Warming up…
          </li>
        )}
      </ul>
      <p className="mt-12 max-w-xs text-center text-sm text-muted">
        This usually takes 30–60 seconds. Hang tight — we&apos;re engineering the
        whole offer.
      </p>
    </div>
  );
}
