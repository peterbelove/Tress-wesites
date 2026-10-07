"use client";

import { useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import type { MediaRow } from "@/db/schema";
import { cn } from "@/lib/utils";

export type MediaLike = Pick<MediaRow, "url" | "altText" | "type" | "title"> &
  Partial<Pick<MediaRow, "thumbnailUrl" | "width" | "height" | "mimeType">>;

export function MediaFallback({
  className,
  label,
  tone = "dark",
}: {
  className?: string;
  label?: string;
  tone?: "dark" | "light";
}) {
  return (
    <div
      aria-hidden
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        tone === "dark"
          ? "grid-lines-dark bg-gradient-to-br from-navy-800 via-navy-900 to-navy-950"
          : "grid-lines bg-gradient-to-br from-mist to-mist-200",
        className,
      )}
    >
      <div className="absolute -top-1/4 -right-1/4 h-2/3 w-2/3 rounded-full bg-green/15 blur-3xl" />
      <div className={cn("relative text-center", tone === "dark" ? "text-white/60" : "text-navy/50")}>
        <div className="display text-4xl tracking-[0.3em]">TRES</div>
        {label ? <div className="eyebrow mt-2 opacity-70">{label}</div> : null}
      </div>
    </div>
  );
}

export function MediaImage({
  media,
  className,
  imgClassName,
  sizes = "100vw",
  priority = false,
  fallbackLabel,
  fallbackTone = "dark",
}: {
  media: MediaLike | null | undefined;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
  fallbackLabel?: string;
  fallbackTone?: "dark" | "light";
}) {
  const [failed, setFailed] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Handle images that were already decoded from cache before onLoad could fire.
    const id = requestAnimationFrame(() => {
      if (el.complete && el.naturalWidth > 0) setLoaded(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  if (!media || !media.url || failed || media.type === "video") {
    return <MediaFallback className={className} label={fallbackLabel} tone={fallbackTone} />;
  }

  return (
    <div className={cn("relative overflow-hidden bg-navy-900/5", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={ref}
        src={media.url}
        alt={media.altText || media.title || ""}
        sizes={sizes}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        width={media.width ?? undefined}
        height={media.height ?? undefined}
        onLoad={() => setLoaded(true)}
        onError={() => setFailed(true)}
        className={cn(
          "h-full w-full object-cover transition-opacity duration-700",
          loaded ? "opacity-100" : "opacity-0",
          imgClassName,
        )}
      />
    </div>
  );
}

export function MediaVideo({
  media,
  poster,
  className,
  autoPlay = true,
  controls = false,
  onUnavailable,
}: {
  media: MediaLike | null | undefined;
  poster?: MediaLike | null;
  className?: string;
  autoPlay?: boolean;
  controls?: boolean;
  onUnavailable?: () => void;
}) {
  const [failed, setFailed] = useState(false);
  const reduceMotion = useReducedMotion() ?? false;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (failed) onUnavailable?.();
  }, [failed, onUnavailable]);

  if (!media || !media.url || failed) {
    if (poster) return <MediaImage media={poster} className={className} />;
    return <MediaFallback className={className} />;
  }

  const shouldAutoplay = autoPlay && !reduceMotion && !controls;

  return (
    <video
      ref={videoRef}
      className={cn("h-full w-full object-cover", className)}
      src={media.url}
      poster={poster?.url || undefined}
      muted
      loop={shouldAutoplay}
      playsInline
      autoPlay={shouldAutoplay}
      controls={controls}
      preload={shouldAutoplay ? "auto" : "metadata"}
      onError={() => setFailed(true)}
      aria-label={media.altText || media.title || "Video"}
    />
  );
}

/** Chooses image or video automatically from the media type. */
export function MediaRenderer({
  media,
  poster,
  className,
  sizes,
  priority,
  fallbackLabel,
}: {
  media: MediaLike | null | undefined;
  poster?: MediaLike | null;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackLabel?: string;
}) {
  if (media?.type === "video") {
    return <MediaVideo media={media} poster={poster} className={className} />;
  }
  return (
    <MediaImage
      media={media}
      className={className}
      sizes={sizes}
      priority={priority}
      fallbackLabel={fallbackLabel}
    />
  );
}
