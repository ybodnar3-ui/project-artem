/**
 * Editorial template — refined, magazine-like, generous whitespace.
 * Pure and self-contained (no env / DB imports) so it can render both the live
 * page and, in Phase 5, a static inline-CSS HTML string.
 */
import type { CSSProperties } from "react";
import type { TemplateProps } from "./index";
import { resolveFontPairVars } from "./fonts";

export default function Editorial({
  config,
  palette,
  contactLink,
  baseUrl,
}: TemplateProps) {
  const s = config.sections;
  const fp = resolveFontPairVars(config.font_pair_id);
  const href = contactLink || "#";

  const rootStyle = {
    "--bg": palette.bg,
    "--ink": palette.ink,
    "--accent": palette.accent,
    "--muted": palette.muted,
    "--font-display": `var(${fp.displayVar})`,
    "--font-body": `var(${fp.bodyVar})`,
    backgroundColor: "var(--bg)",
    color: "var(--ink)",
    fontFamily: "var(--font-body)",
  } as CSSProperties;

  const display: CSSProperties = { fontFamily: "var(--font-display)" };

  return (
    <div className={`${fp.className} min-h-screen w-full`} style={rootStyle}>
      <div className="mx-auto w-full max-w-3xl px-6 sm:px-8">
        {/* Eyebrow */}
        <header className="flex items-center justify-between pt-8 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
          <span>{config.template} edition</span>
          <span className="hidden sm:inline">Offer Machine</span>
        </header>

        {/* Hero */}
        <section className="border-b border-[var(--muted)]/25 py-16 sm:py-24">
          <h1
            style={display}
            className="text-balance text-4xl leading-[1.05] sm:text-6xl"
          >
            {s.hero.headline}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-[var(--ink)]/80">
            {s.hero.subheadline}
          </p>
          <CTA href={href} label={s.hero.cta} />
        </section>

        {/* Problem */}
        <Section label="01 — The problem">
          <h2 style={display} className="text-3xl sm:text-4xl">
            {s.problem.heading}
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--ink)]/80">
            {s.problem.body}
          </p>
        </Section>

        {/* Value stack */}
        <Section label="02 — What you get">
          <ul className="space-y-8">
            {s.value_stack.map((item, i) => (
              <li
                key={i}
                className="grid grid-cols-[auto_1fr] gap-5 border-t border-[var(--muted)]/25 pt-6"
              >
                <span
                  style={display}
                  className="text-xl text-[var(--accent)]"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3 style={display} className="text-xl sm:text-2xl">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-[var(--ink)]/75">{item.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </Section>

        {/* How it works */}
        <Section label="03 — How it works">
          <ol className="grid gap-8 sm:grid-cols-3">
            {s.how_it_works.map((step, i) => (
              <li key={i}>
                <div
                  style={display}
                  className="text-4xl text-[var(--accent)]"
                >
                  {step.step}
                </div>
                <h3 style={display} className="mt-3 text-xl">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-[var(--ink)]/75">
                  {step.description}
                </p>
              </li>
            ))}
          </ol>
        </Section>

        {/* Guarantee */}
        <Section label="04 — The guarantee">
          <div className="rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/[0.06] p-8">
            <h2 style={display} className="text-2xl sm:text-3xl">
              {s.guarantee.heading}
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-[var(--ink)]/80">
              {s.guarantee.body}
            </p>
          </div>
        </Section>

        {/* Pricing */}
        <Section label="05 — Pricing">
          <div className="flex flex-col items-start gap-4">
            <h2 style={display} className="text-3xl sm:text-4xl">
              {s.pricing.heading}
            </h2>
            <div style={display} className="text-6xl text-[var(--accent)]">
              {s.pricing.price}
            </div>
            <p className="max-w-md text-[var(--ink)]/75">{s.pricing.note}</p>
            <CTA href={href} label={s.pricing.cta} />
          </div>
        </Section>

        {/* FAQ */}
        <Section label="06 — Questions">
          <dl className="divide-y divide-[var(--muted)]/25">
            {s.faq.map((item, i) => (
              <div key={i} className="py-6">
                <dt style={display} className="text-xl">
                  {item.q}
                </dt>
                <dd className="mt-2 text-[var(--ink)]/75">{item.a}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* Final CTA */}
        <section className="border-t border-[var(--muted)]/25 py-20 text-center">
          <h2
            style={display}
            className="text-balance text-4xl leading-tight sm:text-5xl"
          >
            {s.final_cta.heading}
          </h2>
          <p className="mx-auto mt-5 max-w-md text-lg text-[var(--ink)]/80">
            {s.final_cta.subheading}
          </p>
          <div className="mt-8 flex justify-center">
            <CTA href={href} label={s.final_cta.cta} />
          </div>
        </section>

        {/* Viral badge */}
        <footer className="flex justify-center border-t border-[var(--muted)]/25 py-8">
          <a
            href={baseUrl}
            className="text-xs uppercase tracking-[0.2em] text-[var(--muted)] transition-opacity hover:opacity-70"
          >
            ⚡ Built with Offer Machine
          </a>
        </footer>
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-[var(--muted)]/25 py-16">
      <p className="mb-8 text-xs uppercase tracking-[0.2em] text-[var(--muted)]">
        {label}
      </p>
      {children}
    </section>
  );
}

function CTA({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="mt-8 inline-block rounded-full bg-[var(--accent)] px-8 py-3 text-sm font-medium uppercase tracking-wide text-[var(--bg)] transition-transform hover:-translate-y-0.5"
    >
      {label}
    </a>
  );
}
