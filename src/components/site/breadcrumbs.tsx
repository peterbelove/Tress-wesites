import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({
  items,
  tone = "light",
  className,
  siteUrl = "",
}: {
  items: Crumb[];
  tone?: "light" | "dark";
  className?: string;
  siteUrl?: string;
}) {
  const all: Crumb[] = [{ label: "Home", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      item: c.href ? `${siteUrl}${c.href}` : undefined,
    })),
  };
  return (
    <nav aria-label="Breadcrumb" className={cn("text-xs", className)}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <ol className="flex flex-wrap items-center gap-1.5">
        {all.map((c, i) => {
          const last = i === all.length - 1;
          return (
            <li key={i} className="flex items-center gap-1.5">
              {c.href && !last ? (
                <Link
                  href={c.href}
                  className={cn(
                    "transition-colors",
                    tone === "dark" ? "text-white/60 hover:text-white" : "text-slate-ink hover:text-navy",
                  )}
                >
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className={tone === "dark" ? "text-white" : "text-navy"}>
                  {c.label}
                </span>
              )}
              {!last ? (
                <ChevronRight className={cn("h-3 w-3", tone === "dark" ? "text-white/40" : "text-navy/30")} />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
