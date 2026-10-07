import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/admin/login-form";
import { LogoMark } from "@/components/site/logo";
import { ensureSeeded } from "@/db/seed";
import { getAdminUser } from "@/lib/auth";

export const metadata: Metadata = { title: "TRES Admin — Sign in", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  await ensureSeeded();
  const { next } = await searchParams;
  if (await getAdminUser()) redirect("/admin/dashboard");
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-navy-950 px-6 py-16 text-white">
      <div className="grid-lines-dark absolute inset-0 opacity-50" aria-hidden />
      <div className="absolute -top-40 right-0 h-[30rem] w-[30rem] rounded-full bg-green/15 blur-3xl" aria-hidden />
      <div className="glass-dark glass-highlight relative w-full max-w-md rounded-3xl p-8 md:p-10">
        <div className="flex items-center gap-3">
          <LogoMark size={40} />
          <div>
            <div className="display text-lg tracking-[0.2em]">TRES</div>
            <div className="font-mono text-[10px] tracking-[0.25em] text-white/50 uppercase">Admin dashboard</div>
          </div>
        </div>
        <h1 className="display mt-8 text-2xl">Sign in</h1>
        <p className="mt-1 text-sm text-white/60">Private area for TRES administrators.</p>
        <div className="mt-8">
          <LoginForm next={next} />
        </div>
        <p className="mt-8 text-[11px] text-white/40">The Rock Engineering Solution Limited · RC 9776971</p>
      </div>
    </main>
  );
}
