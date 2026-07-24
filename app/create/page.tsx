import Link from "next/link";
import type { Metadata } from "next";
import Wizard from "@/components/Wizard";

export const metadata: Metadata = {
  title: "Build your offer — Offer Machine",
};

export default function CreatePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-xl items-center justify-between px-6 py-8 text-xs uppercase tracking-[0.2em] text-muted">
        <Link href="/" className="transition-opacity hover:opacity-60">
          ← Offer Machine
        </Link>
      </header>
      <Wizard />
    </div>
  );
}
