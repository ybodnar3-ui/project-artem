import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6 bg-[#F4F1EA] px-6 text-center text-[#1A1712]">
      <p className="font-mono text-xs uppercase tracking-[0.25em] text-[#6B6459]">
        404 — offer not found
      </p>
      <h1 className="max-w-lg text-balance text-4xl font-semibold sm:text-5xl">
        This offer doesn&apos;t exist (yet).
      </h1>
      <p className="max-w-sm text-[#6B6459]">
        The link may be wrong or the generation expired. Want one of your own?
      </p>
      <Link
        href="/create"
        className="rounded-full bg-[#C2571A] px-8 py-3 text-sm font-medium uppercase tracking-wide text-[#F4F1EA] transition-transform hover:-translate-y-0.5"
      >
        Build your own
      </Link>
    </main>
  );
}
