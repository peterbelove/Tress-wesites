import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPageHeader({
  title,
  description,
  actions,
  backHref,
  backLabel,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  backHref?: string;
  backLabel?: string;
}) {
  return (
    <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        {backHref ? (
          <Link href={backHref} className="mb-2 inline-block text-xs text-slate-ink hover:text-navy">← {backLabel || "Back"}</Link>
        ) : null}
        <h1 className="display text-2xl text-navy md:text-3xl">{title}</h1>
        {description ? <p className="mt-1 max-w-2xl text-sm text-slate-ink">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "green" | "navy" | "amber" | "red" }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium",
        tone === "green" && "bg-green/10 text-green-700",
        tone === "navy" && "bg-navy/10 text-navy",
        tone === "amber" && "bg-amber-100 text-amber-800",
        tone === "red" && "bg-red-100 text-red-700",
        tone === "neutral" && "bg-mist text-slate-ink",
      )}
    >
      {children}
    </span>
  );
}

export function Table({ head, children }: { head: string[]; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-navy/10 bg-white">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-navy/10 bg-mist/60">
            {head.map((h) => (
              <th key={h} className="px-4 py-3 text-[11px] font-medium tracking-wide text-slate-ink uppercase">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-navy/5">{children}</tbody>
      </table>
    </div>
  );
}

export function StatCard({ label, value, hint, href }: { label: string; value: string | number; hint?: string; href?: string }) {
  const body = (
    <div className="card-admin h-full">
      <div className="eyebrow text-slate-ink">{label}</div>
      <div className="display mt-2 text-3xl text-navy">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-ink">{hint}</div> : null}
    </div>
  );
  return href ? <Link href={href} className="block transition-transform hover:-translate-y-0.5">{body}</Link> : body;
}
