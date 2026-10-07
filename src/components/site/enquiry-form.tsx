"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { cn } from "@/lib/utils";

type Option = { label: string; value: string };

export function EnquiryForm({
  services,
  propertyTypes,
  tone = "light",
  source = "contact",
}: {
  services: Option[];
  propertyTypes: string[];
  tone?: "light" | "dark";
  source?: string;
}) {
  const params = useSearchParams();
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const prefillMessage = params.get("message") || "";
  const prefillService = params.get("service") || "";
  const prefillProperty = params.get("property") || "";
  const prefillLocation = params.get("location") || "";

  const dark = tone === "dark";
  const inputCls = cn(
    "w-full rounded-xl border px-4 py-3 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-green/30",
    dark
      ? "border-white/15 bg-white/5 text-white placeholder:text-white/40 focus:border-green-400"
      : "border-navy/15 bg-white text-ink placeholder:text-slate-ink/50 focus:border-green",
  );
  const labelCls = cn("mb-1.5 block text-xs font-medium tracking-wide uppercase", dark ? "text-white/60" : "text-slate-ink");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    const errors: Record<string, string> = {};
    if (!String(data.name || "").trim()) errors.name = "Please tell us your name.";
    if (!String(data.phone || "").trim() && !String(data.email || "").trim())
      errors.phone = "Add a phone number or email so we can reach you.";
    if (!String(data.message || "").trim()) errors.message = "Tell us briefly what you need.";
    setFieldErrors(errors);
    if (Object.keys(errors).length) return;

    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, source }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) throw new Error(json.error || "Something went wrong.");
      setState("sent");
      form.reset();
    } catch (err) {
      setState("error");
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  }

  if (state === "sent") {
    return (
      <div className={cn("rounded-3xl p-8 text-center", dark ? "glass-dark" : "glass")} role="status" aria-live="polite">
        <CheckCircle2 className="mx-auto h-10 w-10 text-green" />
        <h3 className={cn("display mt-4 text-2xl", dark ? "text-white" : "text-navy")}>Thank you. We have your enquiry.</h3>
        <p className={cn("mt-2 text-sm", dark ? "text-white/70" : "text-slate-ink")}>
          A TRES engineer will review it and get back to you.
        </p>
        <button type="button" onClick={() => setState("idle")} className={cn("mt-6", dark ? "btn-outline-light" : "btn-outline")}>
          Send another enquiry
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="space-y-5">
      {/* Honeypot */}
      <div className="hidden" aria-hidden>
        <label htmlFor="company_website">Company website</label>
        <input id="company_website" name="company_website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelCls}>Name *</label>
          <input id="name" name="name" className={inputCls} autoComplete="name" aria-invalid={!!fieldErrors.name} aria-describedby={fieldErrors.name ? "name-error" : undefined} />
          {fieldErrors.name ? <p id="name-error" className="mt-1 text-xs text-red-500">{fieldErrors.name}</p> : null}
        </div>
        <div>
          <label htmlFor="email" className={labelCls}>Email</label>
          <input id="email" name="email" type="email" className={inputCls} autoComplete="email" />
        </div>
        <div>
          <label htmlFor="phone" className={labelCls}>Phone *</label>
          <input id="phone" name="phone" type="tel" className={inputCls} autoComplete="tel" aria-invalid={!!fieldErrors.phone} aria-describedby={fieldErrors.phone ? "phone-error" : undefined} />
          {fieldErrors.phone ? <p id="phone-error" className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p> : null}
        </div>
        <div>
          <label htmlFor="whatsapp" className={labelCls}>WhatsApp</label>
          <input id="whatsapp" name="whatsapp" type="tel" className={inputCls} placeholder="If different from phone" />
        </div>
        <div>
          <label htmlFor="location" className={labelCls}>Location</label>
          <input id="location" name="location" className={inputCls} placeholder="City / State" defaultValue={prefillLocation} />
        </div>
        <div>
          <label htmlFor="propertyType" className={labelCls}>Property / project type</label>
          <select id="propertyType" name="propertyType" className={inputCls} defaultValue={prefillProperty}>
            <option value="">Select…</option>
            {propertyTypes.map((p) => (
              <option key={p} value={p} className="text-ink">{p}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="service" className={labelCls}>What do you need help with?</label>
          <select id="service" name="service" className={inputCls} defaultValue={prefillService}>
            <option value="">Select a service…</option>
            {services.map((s) => (
              <option key={s.value} value={s.value} className="text-ink">{s.label}</option>
            ))}
            <option value="Not sure yet" className="text-ink">Not sure yet — I need advice</option>
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="message" className={labelCls}>Message *</label>
          <textarea id="message" name="message" rows={6} className={inputCls} defaultValue={prefillMessage} placeholder="Tell us what you need to power, protect or improve." aria-invalid={!!fieldErrors.message} aria-describedby={fieldErrors.message ? "message-error" : undefined} />
          {fieldErrors.message ? <p id="message-error" className="mt-1 text-xs text-red-500">{fieldErrors.message}</p> : null}
        </div>
      </div>
      {state === "error" ? (
        <p role="alert" className="rounded-xl border border-red-300/40 bg-red-500/10 px-4 py-3 text-sm text-red-500">{error}</p>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button type="submit" disabled={state === "sending"} className="btn-primary disabled:opacity-60">
          {state === "sending" ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Send Enquiry <ArrowRight className="h-4 w-4" />
        </button>
        <p className={cn("text-xs", dark ? "text-white/70" : "text-slate-ink/70")}>
          Your enquiry goes directly to the TRES engineering team.
        </p>
      </div>
    </form>
  );
}
