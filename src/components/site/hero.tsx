"use client";

import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, Calculator } from "lucide-react";
import { useRef, useState } from "react";
import { MediaImage, MediaVideo, type MediaLike } from "@/components/site/media-renderer";
import { WordReveal } from "@/components/motion/reveal";
import { useMediaQuery, useSaveData } from "@/lib/hooks";

export type HeroMedia = {
  image: MediaLike | null;
  mobileImage: MediaLike | null;
  video: MediaLike | null;
  mobileVideo: MediaLike | null;
  poster: MediaLike | null;
};

export function Hero({
  title,
  subtitle,
  primary,
  secondary,
  media,
}: {
  title: string;
  subtitle?: string;
  primary?: { label: string; href: string } | null;
  secondary?: { label: string; href: string } | null;
  media: HeroMedia;
}) {
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const isMobile = useMediaQuery("(max-width: 767px)");
  const saveData = useSaveData();
  const [videoFailed, setVideoFailed] = useState(false);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.08]);

  const image = (isMobile ? media.mobileImage : null) || media.image || media.poster;
  const video = (isMobile ? media.mobileVideo : null) || media.video;
  const poster = media.poster || image;
  // On small screens with a data-saver connection, show the poster image instead of the video.
  const showVideo = Boolean(video) && !videoFailed && !(isMobile && saveData);

  return (
    <section ref={ref} className="relative isolate flex min-h-[100svh] items-end overflow-hidden bg-navy-950 text-white">
      {/* Media layer */}
      <motion.div
        className="absolute inset-0 -z-10"
        style={reduce ? undefined : { y, scale }}
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.4, ease: "easeOut" }}
      >
        <MediaImage media={image} className="absolute inset-0 h-full w-full" priority sizes="100vw" />
        {showVideo ? (
          <div className="absolute inset-0">
            <MediaVideo media={video} poster={poster} className="absolute inset-0" onUnavailable={() => setVideoFailed(true)} />
          </div>
        ) : null}
      </motion.div>
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-950 via-navy-950/40 to-navy-950/30" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-950/60 via-transparent to-transparent" />
      <div className="grid-lines-dark absolute inset-0 -z-10 opacity-40" aria-hidden />

      <div className="relative mx-auto w-full max-w-7xl px-6 pt-40 pb-16 md:pb-24">
        <WordReveal
          text={title}
          delay={0.45}
          className="display max-w-5xl text-[2.75rem] leading-[0.98] sm:text-6xl md:text-7xl lg:text-[6.5rem]"
        />
        {subtitle ? (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 1.0 }}
            className="mt-7 max-w-xl text-lg leading-relaxed text-white/80 md:text-2xl"
          >
            {subtitle}
          </motion.p>
        ) : null}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 1.25 }}
          className="mt-10 flex flex-col gap-3 sm:flex-row"
        >
          {primary?.label ? (
            <Link href={primary.href || "/services"} className="btn-primary">
              {primary.label} <ArrowRight className="h-4 w-4" />
            </Link>
          ) : null}
          {secondary?.label ? (
            <Link href={secondary.href || "/solar-calculator"} className="btn-glass">
              <Calculator className="h-4 w-4" /> {secondary.label}
            </Link>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
