import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

type Tone = "light" | "dark";

export function GlassCard({
  tone = "light",
  className,
  children,
  ...rest
}: { tone?: Tone; className?: string; children: ReactNode } & ComponentPropsWithoutRef<"div">) {
  return (
    <div
      className={cn(
        "glass-highlight rounded-2xl p-6",
        tone === "light" ? "glass" : "glass-dark",
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function GlassPanel({
  tone = "light",
  className,
  children,
}: {
  tone?: Tone;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-3xl p-8 md:p-10",
        tone === "light" ? "glass-strong" : "glass-dark-strong",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function GlassMetric({
  label,
  value,
  unit,
  tone = "dark",
  className,
}: {
  label: string;
  value: string | number;
  unit?: string;
  tone?: Tone;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl px-5 py-4",
        tone === "light" ? "glass" : "glass-dark",
        className,
      )}
    >
      <div className={cn("eyebrow", tone === "light" ? "text-slate-ink" : "text-white/60")}>
        {label}
      </div>
      <div className="mt-2 flex items-baseline gap-1.5">
        <span
          className={cn(
            "display text-3xl md:text-4xl",
            tone === "light" ? "text-navy" : "text-white",
          )}
        >
          {value}
        </span>
        {unit ? <span className="text-sm font-medium text-green-400">{unit}</span> : null}
      </div>
    </div>
  );
}

export function GlassButton({
  href,
  children,
  className,
  variant = "glass",
}: {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "glass" | "primary" | "navy" | "outline" | "outline-light";
}) {
  const cls =
    variant === "primary"
      ? "btn-primary"
      : variant === "navy"
        ? "btn-navy"
        : variant === "outline"
          ? "btn-outline"
          : variant === "outline-light"
            ? "btn-outline-light"
            : "btn-glass";
  const external = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:");
  if (external) {
    return (
      <a
        href={href}
        className={cn(cls, className)}
        target={href.startsWith("http") ? "_blank" : undefined}
        rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cn(cls, className)}>
      {children}
    </Link>
  );
}

export function GlassOverlay({ className, children }: { className?: string; children?: ReactNode }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/85 via-navy-950/30 to-transparent",
        className,
      )}
    >
      {children}
    </div>
  );
}
