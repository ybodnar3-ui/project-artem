/**
 * Placeholder homepage (Phase 0 smoke page).
 * The real editorial hero + "how it works" ships in Phase 4.
 */
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="font-mono text-sm uppercase tracking-widest text-neutral-500">
        Offer Machine
      </p>
      <h1 className="max-w-2xl text-balance text-4xl font-semibold sm:text-5xl">
        Package your business in ~40 seconds.
      </h1>
      <p className="max-w-md text-neutral-500">
        Scaffold live. Build in progress — Phase 0 complete.
      </p>
    </main>
  );
}
