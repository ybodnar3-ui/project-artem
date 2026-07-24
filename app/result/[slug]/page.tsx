import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { loadGeneration } from "@/lib/load";
import { env } from "@/lib/env";
import ResultTabs from "@/components/ResultTabs";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export const metadata: Metadata = {
  title: "Your offer — Offer Machine",
};

export default async function ResultPage({ params }: Params) {
  const { slug } = await params;
  const gen = await loadGeneration(slug);
  if (!gen) notFound();

  const url = `${env.baseUrl}/p/${slug}`;

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-4xl items-center justify-between px-6 py-8 text-xs uppercase tracking-[0.2em] text-muted">
        <Link href="/" className="transition-opacity hover:opacity-60">
          ← Offer Machine
        </Link>
        <Link href="/create" className="transition-opacity hover:opacity-60">
          Build another
        </Link>
      </header>

      <div className="border-b border-muted/20">
        <div className="mx-auto w-full max-w-4xl px-6 pb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-accent">
            Your offer is ready
          </p>
          <h1 className="mt-3 font-serif text-4xl leading-tight sm:text-5xl">
            {gen.offer.offer_name}
          </h1>
        </div>
      </div>

      <ResultTabs slug={slug} offer={gen.offer} url={url} />
    </div>
  );
}
