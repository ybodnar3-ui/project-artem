import Link from "next/link";

const STEPS = [
  {
    n: "01",
    title: "Answer 5 questions",
    body: "Tell us what you sell, who it's for, and what makes you different. Two minutes, no forms.",
  },
  {
    n: "02",
    title: "We engineer the offer",
    body: "A $100M-Offers breakdown — value stack, guarantee, pricing, scarcity — built from your answers.",
  },
  {
    n: "03",
    title: "Get a live landing page",
    body: "A premium, shareable page you couldn't build in ChatGPT or a website builder. Yours in ~40 seconds.",
  },
];

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 sm:px-8">
      {/* Nav */}
      <header className="flex items-center justify-between py-8 text-xs uppercase tracking-[0.2em] text-muted">
        <span className="font-medium text-foreground">Offer Machine</span>
        <Link href="/p/demo" className="transition-opacity hover:opacity-60">
          See an example
        </Link>
      </header>

      {/* Hero */}
      <section className="border-b border-muted/25 py-16 sm:py-24">
        <p className="mb-6 text-xs uppercase tracking-[0.2em] text-accent">
          Package your business in ~40 seconds
        </p>
        <h1 className="font-serif text-5xl leading-[1.03] text-balance sm:text-7xl">
          The offer you should be selling — plus the page to sell it.
        </h1>
        <p className="mt-8 max-w-xl text-lg leading-relaxed text-foreground/80">
          Answer five questions about your business. Get a Hormozi-grade offer
          and a live, shareable premium landing page — the kind you can&apos;t
          make in ChatGPT or a template builder.
        </p>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/create"
            className="inline-block rounded-full bg-accent px-8 py-3.5 text-sm font-medium uppercase tracking-wide text-background transition-transform hover:-translate-y-0.5"
          >
            Build my offer
          </Link>
          <Link
            href="/p/demo"
            className="text-sm text-muted underline underline-offset-4 transition-opacity hover:opacity-60"
          >
            or see a finished example →
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16">
        <p className="mb-10 text-xs uppercase tracking-[0.2em] text-muted">
          How it works
        </p>
        <ol className="grid gap-10 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n}>
              <div className="font-serif text-4xl text-accent">{s.n}</div>
              <h3 className="mt-3 font-serif text-xl">{s.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-foreground/75">
                {s.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Closing CTA */}
      <section className="border-t border-muted/25 py-20 text-center">
        <h2 className="font-serif text-4xl leading-tight text-balance sm:text-5xl">
          Your business, finally packaged like it&apos;s worth it.
        </h2>
        <div className="mt-8 flex justify-center">
          <Link
            href="/create"
            className="inline-block rounded-full bg-accent px-8 py-3.5 text-sm font-medium uppercase tracking-wide text-background transition-transform hover:-translate-y-0.5"
          >
            Build my offer
          </Link>
        </div>
      </section>

      <footer className="flex justify-center py-8 text-xs uppercase tracking-[0.2em] text-muted">
        ⚡ Offer Machine
      </footer>
    </main>
  );
}
