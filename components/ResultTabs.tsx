"use client";

import { useState } from "react";
import type { Offer } from "@/lib/schemas";

function offerToText(o: Offer): string {
  const stack = o.value_stack
    .map((v) => `- ${v.solution} (${v.value_label}) — solves: ${v.problem}`)
    .join("\n");
  const bonuses = o.bonuses
    .map((b) => `- ${b.name} (${b.value_label}): ${b.description}`)
    .join("\n");
  return [
    `OFFER: ${o.offer_name}`,
    ``,
    `Dream outcome: ${o.dream_outcome}`,
    ``,
    `Value stack:`,
    stack,
    ``,
    `Bonuses:`,
    bonuses,
    ``,
    `Guarantee — ${o.guarantee.name}: ${o.guarantee.statement}`,
    ``,
    `Pricing: ${o.pricing.price} (anchor ${o.pricing.anchor}). ${o.pricing.framing}`,
    ``,
    `Scarcity: ${o.scarcity}`,
    `Urgency: ${o.urgency}`,
  ].join("\n");
}

function CopyButton({
  text,
  label,
  copiedLabel,
}: {
  text: string;
  label: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* clipboard blocked — no-op */
        }
      }}
      className="rounded-full border border-muted/40 px-5 py-2 text-xs uppercase tracking-wide transition-colors hover:border-foreground"
    >
      {copied ? copiedLabel : label}
    </button>
  );
}

export default function ResultTabs({
  slug,
  offer,
  url,
}: {
  slug: string;
  offer: Offer;
  url: string;
}) {
  const [tab, setTab] = useState<"offer" | "landing">("offer");

  return (
    <div className="mx-auto w-full max-w-4xl px-6 py-8">
      {/* Actions */}
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <CopyButton text={url} label="Copy link" copiedLabel="Copied!" />
        <CopyButton
          text={offerToText(offer)}
          label="Copy offer"
          copiedLabel="Copied!"
        />
        <button
          disabled
          title="Coming in the next step"
          className="cursor-not-allowed rounded-full border border-muted/25 px-5 py-2 text-xs uppercase tracking-wide text-muted/60"
        >
          Download HTML
        </button>
        <button
          disabled
          title="Coming in the next step"
          className="cursor-not-allowed rounded-full border border-muted/25 px-5 py-2 text-xs uppercase tracking-wide text-muted/60"
        >
          Regenerate style
        </button>
      </div>

      {/* Tab switch */}
      <div className="mb-6 flex gap-1 rounded-full border border-muted/30 p-1 text-sm">
        <button
          onClick={() => setTab("offer")}
          className={`flex-1 rounded-full px-4 py-2 uppercase tracking-wide transition-colors ${
            tab === "offer" ? "bg-accent text-background" : "text-muted"
          }`}
        >
          Offer
        </button>
        <button
          onClick={() => setTab("landing")}
          className={`flex-1 rounded-full px-4 py-2 uppercase tracking-wide transition-colors ${
            tab === "landing" ? "bg-accent text-background" : "text-muted"
          }`}
        >
          Landing
        </button>
      </div>

      {tab === "offer" ? (
        <OfferView offer={offer} />
      ) : (
        <div className="overflow-hidden rounded-xl border border-muted/30">
          <iframe
            src={`/p/${slug}`}
            title="Landing preview"
            className="h-[80vh] w-full bg-white"
          />
        </div>
      )}
    </div>
  );
}

function OfferView({ offer: o }: { offer: Offer }) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted">
          Offer name
        </p>
        <h2 className="mt-2 font-serif text-3xl">{o.offer_name}</h2>
      </div>

      <Block label="Dream outcome">
        <p className="text-foreground/85">{o.dream_outcome}</p>
      </Block>

      <Block label="Value stack">
        <ul className="space-y-3">
          {o.value_stack.map((v, i) => (
            <li key={i} className="border-t border-muted/20 pt-3">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium">{v.solution}</span>
                <span className="whitespace-nowrap text-sm text-accent">
                  {v.value_label}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted">Solves: {v.problem}</p>
            </li>
          ))}
        </ul>
      </Block>

      <Block label="Bonuses">
        <ul className="space-y-3">
          {o.bonuses.map((b, i) => (
            <li key={i} className="border-t border-muted/20 pt-3">
              <div className="flex items-baseline justify-between gap-4">
                <span className="font-medium">{b.name}</span>
                <span className="whitespace-nowrap text-sm text-accent">
                  {b.value_label}
                </span>
              </div>
              <p className="mt-1 text-sm text-foreground/75">{b.description}</p>
            </li>
          ))}
        </ul>
      </Block>

      <Block label={`Guarantee — ${o.guarantee.name}`}>
        <p className="text-foreground/85">{o.guarantee.statement}</p>
      </Block>

      <Block label="Pricing">
        <p className="font-serif text-4xl text-accent">{o.pricing.price}</p>
        <p className="mt-2 text-sm text-muted">Anchor: {o.pricing.anchor}</p>
        <p className="mt-2 text-foreground/85">{o.pricing.framing}</p>
      </Block>

      <div className="grid gap-6 sm:grid-cols-2">
        <Block label="Scarcity">
          <p className="text-foreground/85">{o.scarcity}</p>
        </Block>
        <Block label="Urgency">
          <p className="text-foreground/85">{o.urgency}</p>
        </Block>
      </div>
    </div>
  );
}

function Block({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <p className="mb-3 text-xs uppercase tracking-[0.2em] text-muted">
        {label}
      </p>
      {children}
    </div>
  );
}
