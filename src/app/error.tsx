"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Logo } from "@/components/site/logo";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-navy-950 text-white">
      <div className="grid-lines-dark absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto w-full max-w-5xl px-6 py-24">
        <Logo tone="light" />
        <div className="mt-16 font-mono text-xs tracking-[0.25em] text-green-400">SOMETHING INTERRUPTED THE SUPPLY</div>
        <h1 className="display mt-4 text-5xl md:text-7xl">WE HIT A FAULT.</h1>
        <p className="mt-6 max-w-lg text-lg text-white/70">An unexpected error occurred. You can try again, or head back to the homepage.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="btn-primary">Try again</button>
          <Link href="/" className="btn-outline-light">Back to Home</Link>
        </div>
        {error.digest ? <p className="mt-8 font-mono text-[11px] text-white/40">Reference: {error.digest}</p> : null}
      </div>
    </main>
  );
}
