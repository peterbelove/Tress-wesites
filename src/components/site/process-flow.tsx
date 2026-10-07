"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { SectionItem } from "@/db/schema";
import { cn } from "@/lib/utils";

/** Visual progression — nodes and an energising connector line, no numbering. */
export function ProcessFlow({ steps, tone = "light" }: { steps: SectionItem[]; tone?: "light" | "dark" }) {
  const dark = tone === "dark";
  const reduce = useReducedMotion();
  if (!steps.length) return null;
  return (
    <ol className="relative grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
      {steps.map((step, i) => (
        <motion.li
          key={`${step.title}-${i}`}
          initial={reduce ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10% 0px" }}
          transition={{ duration: 0.9, delay: Math.min(i * 0.07, 0.5), ease: [0.22, 1, 0.36, 1] }}
          className="relative pt-8"
        >
          <div className={cn("absolute top-[11px] left-0 h-px w-full", dark ? "bg-white/15" : "bg-navy/10")}>
            <motion.div
              className="h-full origin-left bg-green"
              initial={reduce ? { scaleX: 1 } : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true, margin: "-10% 0px" }}
              transition={{ duration: 1.1, delay: 0.25 + i * 0.1, ease: "easeOut" }}
            />
          </div>
          <span
            className={cn(
              "absolute top-0 left-0 flex h-[23px] w-[23px] items-center justify-center rounded-full border",
              dark ? "border-white/30 bg-navy-900" : "border-navy/20 bg-white",
            )}
          >
            <span className="h-2 w-2 rounded-full bg-green animate-pulse-soft" />
          </span>
          <h3 className={cn("display text-xl", dark ? "text-white" : "text-navy")}>{step.title}</h3>
          {step.text ? (
            <p className={cn("mt-2 text-sm leading-relaxed", dark ? "text-white/65" : "text-slate-ink")}>{step.text}</p>
          ) : null}
        </motion.li>
      ))}
    </ol>
  );
}
