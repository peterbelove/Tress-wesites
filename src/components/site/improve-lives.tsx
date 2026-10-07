"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { SectionItem } from "@/db/schema";
import { MediaImage, MediaVideo, type MediaLike } from "@/components/site/media-renderer";
import { Parallax } from "@/components/motion/reveal";

export function ImproveLives({
  title,
  body,
  words,
  media,
  video,
  tagline,
}: {
  title: string;
  body?: string;
  words: SectionItem[];
  media: MediaLike | null;
  video?: MediaLike | null;
  tagline: string;
}) {
  const reduce = useReducedMotion();
  const ease = [0.22, 1, 0.36, 1] as const;
  return (
    <section className="relative overflow-hidden bg-navy-950 text-white">
      {video ? (
        <div className="absolute inset-0">
          <MediaVideo media={video} poster={media} className="absolute inset-0" />
        </div>
      ) : (
        <Parallax className="absolute inset-0" amount={70}>
          <MediaImage media={media} className="h-[120%] w-full -translate-y-[10%]" sizes="100vw" />
        </Parallax>
      )}
      <div className="absolute inset-0 bg-navy-950/75" />
      <div className="absolute inset-0 bg-gradient-to-b from-navy-950 via-transparent to-navy-950" />

      <div className="relative mx-auto max-w-7xl px-6 py-32 md:py-44">
        <div className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15% 0px" }}
              transition={{ duration: 1.1, ease }}
            >
              <h2 className="display text-4xl md:text-6xl">{title}</h2>
              {body ? <p className="mt-7 max-w-md text-lg leading-relaxed text-white/75">{body}</p> : null}
            </motion.div>
          </div>
          <div className="lg:col-span-7">
            <ul>
              {words.map((w, i) => (
                <motion.li
                  key={`${w.title}-${i}`}
                  initial={reduce ? false : { opacity: 0, x: 32 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-10% 0px" }}
                  transition={{ duration: 1, delay: i * 0.14, ease }}
                  className="flex flex-col gap-1 border-b border-white/10 py-5 md:flex-row md:items-baseline md:justify-between md:gap-8"
                >
                  <span className="display text-4xl tracking-[-0.02em] md:text-6xl lg:text-7xl">{w.title}</span>
                  {w.text ? <span className="max-w-xs text-sm text-white/70 md:text-right">{w.text}</span> : null}
                </motion.li>
              ))}
            </ul>
            <motion.p
              initial={reduce ? false : { opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1.1, delay: 0.4, ease }}
              className="mt-12 flex max-w-xl items-baseline gap-5"
            >
              <span className="display text-2xl tracking-[0.3em] text-white">TRES</span>
              <span className="h-px w-10 shrink-0 translate-y-[-0.3em] bg-green" aria-hidden />
              <span className="text-lg text-white/75">{tagline}</span>
            </motion.p>
          </div>
        </div>
      </div>
    </section>
  );
}
