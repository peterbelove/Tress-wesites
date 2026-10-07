import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { MediaImage } from "@/components/site/media-renderer";
import type { Insight, Market, Project, Service } from "@/lib/cms";
import { cn, formatDateShort, isPlaceholderCover } from "@/lib/utils";

export function ServiceCard({
  service,
  variant = "standard",
  className,
}: {
  service: Service;
  variant?: "feature" | "standard";
  className?: string;
}) {
  const feature = variant === "feature";
  return (
    <Link
      href={`/services/${service.slug}`}
      className={cn(
        "group relative block overflow-hidden rounded-3xl bg-navy-900 text-white",
        feature ? "min-h-[28rem] md:min-h-full" : "min-h-[18rem]",
        className,
      )}
    >
      <MediaImage
        media={service.media}
        className="absolute inset-0 h-full w-full"
        imgClassName="transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
        sizes={feature ? "(min-width: 768px) 66vw, 100vw" : "(min-width: 768px) 33vw, 100vw"}
        fallbackLabel={service.title}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/25 to-navy-950/5" />
      <div className="absolute top-5 right-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-white/10 backdrop-blur-md transition-all duration-500 group-hover:border-green group-hover:bg-green">
        <ArrowUpRight className="h-4 w-4" />
      </div>
      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <div className={cn(feature && "md:max-w-lg")}>
          <h3 className={cn("display", feature ? "text-2xl md:text-4xl" : "text-xl")}>{service.title}</h3>
          <p
            className={cn(
              "mt-2 text-sm leading-relaxed text-white/75",
              feature ? "line-clamp-2 md:text-base" : "line-clamp-2",
            )}
          >
            {feature ? service.headline || service.summary : service.summary}
          </p>
        </div>
      </div>
    </Link>
  );
}

export function MarketCard({ market, className }: { market: Market; className?: string }) {
  return (
    <Link
      href={`/markets/${market.slug}`}
      className={cn("group relative block aspect-[4/5] overflow-hidden rounded-3xl bg-navy-900 text-white", className)}
    >
      <MediaImage
        media={market.media}
        className="absolute inset-0 h-full w-full"
        imgClassName="transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
        fallbackLabel={market.title}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 via-navy-950/20 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-6">
        <div className="eyebrow mb-3 text-green-400">{market.title}</div>
        <h3 className="display text-xl leading-tight md:text-2xl">{market.headline}</h3>
        <p className="mt-2 line-clamp-2 text-sm text-white/75">{market.summary}</p>
        <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium">
          <span className="border-b border-white/40 pb-0.5 transition-colors group-hover:border-green-400">
            {market.ctaLabel || "Explore"}
          </span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>
      </div>
    </Link>
  );
}

export function projectSpecs(project: Pick<Project, "energyCapacity" | "systemCapacity">) {
  return [project.energyCapacity, project.systemCapacity].filter(Boolean).join(" + ");
}

export function ProjectCard({
  project,
  className,
  tone = "light",
  variant = "standard",
}: {
  project: Project;
  className?: string;
  tone?: "light" | "dark";
  variant?: "standard" | "compact";
}) {
  const dark = tone === "dark";
  const specs = projectSpecs(project);
  const meta = [project.location, specs].filter(Boolean);
  const placeholder = isPlaceholderCover(project.cover);
  return (
    <Link href={`/projects/${project.slug}`} className={cn("group block", className)}>
      <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-navy-900">
        {placeholder ? (
          <div className="grid-lines-dark flex h-full w-full flex-col items-center justify-center gap-3 bg-navy-900 p-6 text-center">
            {project.category ? <span className="eyebrow text-green-400">{project.category}</span> : null}
            <span className="text-sm text-white/70">Project photography coming soon</span>
          </div>
        ) : (
          <>
            <MediaImage
              media={project.cover}
              className="absolute inset-0 h-full w-full"
              imgClassName="transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              fallbackLabel={project.category}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950/40 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" />
          </>
        )}
      </div>
      <div className="mt-5">
        {project.category ? (
          <div className={cn("eyebrow", dark ? "text-green-400" : "text-green-700")}>{project.category}</div>
        ) : null}
        <h3 className={cn("display mt-2 text-xl", dark ? "text-white" : "text-navy")}>{project.title}</h3>
        {meta.length ? (
          <p className={cn("mt-1.5 text-sm", dark ? "text-white/60" : "text-slate-ink")}>{meta.join(" · ")}</p>
        ) : null}
        {variant === "standard" && project.summary ? (
          <p className={cn("mt-2 line-clamp-2 text-sm leading-relaxed", dark ? "text-white/70" : "text-slate-ink")}>
            {project.summary}
          </p>
        ) : null}
        <span className={cn("mt-4 inline-flex items-center gap-1.5 text-sm font-medium", dark ? "text-white" : "text-navy")}>
          <span className={cn("border-b pb-0.5 transition-colors group-hover:border-green", dark ? "border-white/30" : "border-navy/20")}>
            View project
          </span>
          <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </div>
    </Link>
  );
}

export function InsightCard({
  insight,
  className,
  tone = "light",
}: {
  insight: Insight;
  className?: string;
  tone?: "light" | "dark";
}) {
  const dark = tone === "dark";
  return (
    <Link href={`/insights/${insight.slug}`} className={cn("group block", className)}>
      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl bg-navy-900">
        <MediaImage
          media={insight.cover}
          className="absolute inset-0 h-full w-full"
          imgClassName="transition-transform duration-[1600ms] ease-out group-hover:scale-[1.04]"
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          fallbackLabel={insight.category}
        />
      </div>
      <div className="mt-5">
        <div className={cn("flex items-center gap-3 text-xs", dark ? "text-white/60" : "text-slate-ink")}>
          <span className={cn("font-medium", dark ? "text-green-400" : "text-green-700")}>{insight.category}</span>
          <span aria-hidden>·</span>
          <time dateTime={new Date(insight.publishedAt).toISOString()}>{formatDateShort(insight.publishedAt)}</time>
        </div>
        <h3 className={cn("display mt-2 text-xl leading-snug", dark ? "text-white" : "text-navy")}>{insight.title}</h3>
        <p className={cn("mt-2 line-clamp-2 text-sm leading-relaxed", dark ? "text-white/70" : "text-slate-ink")}>
          {insight.excerpt}
        </p>
      </div>
    </Link>
  );
}
