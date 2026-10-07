"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { loginAction, type LoginState } from "@/lib/admin-actions";

export function LoginForm({ next }: { next?: string }) {
  const [state, action, pending] = useActionState<LoginState, FormData>(loginAction, {});
  return (
    <form action={action} className="space-y-5">
      {next ? <input type="hidden" name="next" value={next} /> : null}
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium tracking-wide text-white/60 uppercase">Email</span>
        <input name="email" type="email" autoComplete="username" required className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green/30" />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-xs font-medium tracking-wide text-white/60 uppercase">Password</span>
        <input name="password" type="password" autoComplete="current-password" required className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green/30" />
      </label>
      {state.error ? <p role="alert" className="rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{state.error}</p> : null}
      <button type="submit" disabled={pending} className="btn-primary w-full disabled:opacity-60">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null} Sign in <ArrowRight className="h-4 w-4" />
      </button>
    </form>
  );
}
