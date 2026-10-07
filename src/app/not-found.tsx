import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Logo } from "@/components/site/logo";

export default function NotFound() {
  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-navy-950 text-white">
      <div className="grid-lines-dark absolute inset-0 opacity-50" aria-hidden />
      <div className="absolute -top-40 right-0 h-[30rem] w-[30rem] rounded-full bg-green/15 blur-3xl" aria-hidden />
      <div className="relative mx-auto w-full max-w-5xl px-6 py-24">
        <Logo tone="light" />
        <div className="mt-16 font-mono text-xs tracking-[0.25em] text-green-400">ERROR 404 — PAGE NOT FOUND</div>
        <h1 className="display mt-4 text-5xl md:text-7xl">THIS PAGE IS OFF-GRID.</h1>
        <p className="mt-6 max-w-lg text-lg text-white/70">The page you are looking for has moved or never existed. Let us get you back to something useful.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">Back to Home <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/services" className="btn-outline-light">Explore Services</Link>
          <Link href="/solar-calculator" className="btn-outline-light">Solar Calculator</Link>
          <Link href="/contact" className="btn-outline-light">Talk to TRES</Link>
        </div>
      </div>
    </main>
  );
}
