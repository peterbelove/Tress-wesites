import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/site/breadcrumbs";
import { MediaImage, type MediaLike } from "@/components/site/media-renderer";
import { Reveal, WordReveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function PageHero({
  title,
  meta,
  subtitle,
  media,
  crumbs,
  children,
  compact = false,
  align = "left",
}: {
  title: string;
  meta?: string;
  subtitle?: string;
  media?: MediaLike | null;
  crumbs?: Crumb[];
  children?: ReactNode;
  compact?: boolean;
  align?: "left" | "center";
}) {
  return (
    <section className="relative isolate overflow-hidden bg-navy-950 text-white">
      {media ? (
        <>
          <MediaImage media={media} className="absolute inset-0 -z-10 h-full w-full" priority sizes="100vw" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 via-navy-950/70 to-navy-950/40" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-navy-900 via-navy-950 to-navy-950" />
          <div className="absolute -top-32 right-0 -z-10 h-[30rem] w-[30rem] rounded-full bg-green/15 blur-3xl" aria-hidden />
        </>
      )}
      <div className="grid-lines-dark absolute inset-0 -z-10 opacity-50" aria-hidden />
      <div
        className={cn(
          "mx-auto max-w-7xl px-6",
          compact ? "pt-36 pb-16 md:pt-44 md:pb-20" : "pt-40 pb-20 md:pt-52 md:pb-28",
          align === "center" && "text-center",
        )}
      >
        {crumbs ? (
          <Reveal className={cn("mb-8", align === "center" && "flex justify-center")} y={10}>
            <Breadcrumbs items={crumbs} tone="dark" />
          </Reveal>
        ) : null}
        <WordReveal
          text={title}
          delay={0.15}
          className={cn(
            "display max-w-5xl text-4xl leading-[1.02] md:text-6xl lg:text-7xl",
            align === "center" && "mx-auto",
          )}
        />
        {meta ? (
          <Reveal delay={0.35} className={cn("mt-4 text-sm text-white/70", align === "center" && "mx-auto")}>
            {meta}
          </Reveal>
        ) : null}
        {subtitle ? (
          <Reveal delay={0.4} className={cn("mt-5 max-w-2xl text-lg leading-relaxed text-white/75 md:text-xl", align === "center" && "mx-auto")}>
            {subtitle}
          </Reveal>
        ) : null}
        {children ? <Reveal delay={0.55} className="mt-10">{children}</Reveal> : null}
      </div>
    </section>
  );
}
