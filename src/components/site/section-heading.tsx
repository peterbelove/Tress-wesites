import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  title,
  subtitle,
  tone = "light",
  align = "left",
  action,
  className,
  size = "md",
}: {
  title: string;
  subtitle?: string;
  tone?: "light" | "dark";
  align?: "left" | "center";
  action?: { label: string; href: string } | null;
  className?: string;
  size?: "md" | "lg";
}) {
  const dark = tone === "dark";
  return (
    <div
      className={cn(
        "flex flex-col gap-6 md:flex-row md:items-end md:justify-between",
        align === "center" && "md:flex-col md:items-center md:text-center",
        className,
      )}
    >
      <Reveal className="max-w-3xl">
        <h2
          className={cn(
            "display whitespace-pre-line",
            size === "lg"
              ? "text-4xl md:text-6xl lg:text-7xl"
              : "text-3xl md:text-5xl",
            dark ? "text-white" : "text-navy",
          )}
        >
          {title}
        </h2>
        {subtitle ? (
          <p className={cn("mt-5 max-w-2xl text-lg leading-relaxed", dark ? "text-white/70" : "text-slate-ink")}>
            {subtitle}
          </p>
        ) : null}
      </Reveal>
      {action?.label && action?.href ? (
        <Reveal delay={0.15}>
          <Link
            href={action.href}
            className={cn(
              "group inline-flex items-center gap-2 text-sm font-medium",
              dark ? "text-white" : "text-navy",
            )}
          >
            <span className="border-b border-current pb-0.5">{action.label}</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>
      ) : null}
    </div>
  );
}
