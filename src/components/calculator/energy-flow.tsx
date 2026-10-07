"use client";

import type React from "react";
import { BatteryCharging, Building2, Home, Sun, Zap } from "lucide-react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

function Node({
  icon: Icon,
  label,
  value,
  active,
  className,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value?: string;
  active?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center gap-2 text-center", className)}>
      <div
        className={cn(
          "glass-dark glass-highlight relative flex h-16 w-16 items-center justify-center rounded-2xl md:h-20 md:w-20",
          active && "ring-1 ring-green-400/60",
        )}
      >
        <Icon className={cn("h-7 w-7", active ? "text-green-400" : "text-white/80")} />
        {active ? <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 animate-pulse-soft" /> : null}
      </div>
      <div className="eyebrow text-white/50">{label}</div>
      {value ? <div className="font-mono text-sm text-white">{value}</div> : null}
    </div>
  );
}

function Flow({ vertical = false, reverse = false }: { vertical?: boolean; reverse?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <svg
      className={cn(vertical ? "h-10 w-6" : "h-6 w-full min-w-[2rem] flex-1")}
      viewBox={vertical ? "0 0 24 40" : "0 0 100 24"}
      preserveAspectRatio="none"
      aria-hidden
    >
      <line
        x1={vertical ? 12 : 0}
        y1={vertical ? 0 : 12}
        x2={vertical ? 12 : 100}
        y2={vertical ? 40 : 12}
        stroke="rgba(255,255,255,0.15)"
        strokeWidth="2"
      />
      <line
        x1={vertical ? 12 : 0}
        y1={vertical ? 0 : 12}
        x2={vertical ? 12 : 100}
        y2={vertical ? 40 : 12}
        stroke="#38d286"
        strokeWidth="2"
        strokeDasharray="6 6"
        className={reduce ? undefined : "animate-flow"}
        style={reverse ? { animationDirection: "reverse" } : undefined}
      />
    </svg>
  );
}

export function EnergyFlow({
  solarKw,
  batteryKwh,
  inverterKva,
  propertyType,
  className,
}: {
  solarKw?: number;
  batteryKwh?: number;
  inverterKva?: number;
  propertyType?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const isHome = !propertyType || propertyType.toLowerCase() === "residential";
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className={cn("relative rounded-3xl border border-white/10 bg-navy-950 p-6 md:p-8", className)}
    >
      <div className="grid-lines-dark absolute inset-0 rounded-3xl opacity-60" aria-hidden />
      <div className="relative">
        {/* Desktop: horizontal */}
        <div className="hidden items-center gap-2 md:flex">
          <Node icon={Sun} label="Sun" active />
          <Flow />
          <Node icon={PanelIcon} label="Solar" value={solarKw ? `${solarKw} kW` : undefined} active={!!solarKw} />
          <Flow />
          <div className="flex flex-col items-center">
            <Node icon={Zap} label="Inverter" value={inverterKva ? `${inverterKva} kVA` : undefined} active={!!inverterKva} />
            <Flow vertical />
            <Node icon={BatteryCharging} label="Battery" value={batteryKwh ? `${batteryKwh} kWh` : undefined} active={!!batteryKwh} />
          </div>
          <Flow />
          <Node icon={isHome ? Home : Building2} label={isHome ? "Home" : "Business"} active />
        </div>
        {/* Mobile: vertical */}
        <div className="flex flex-col items-center gap-1 md:hidden">
          <Node icon={Sun} label="Sun" active />
          <Flow vertical />
          <Node icon={PanelIcon} label="Solar" value={solarKw ? `${solarKw} kW` : undefined} active={!!solarKw} />
          <Flow vertical />
          <div className="flex items-center gap-3">
            <Node icon={BatteryCharging} label="Battery" value={batteryKwh ? `${batteryKwh} kWh` : undefined} active={!!batteryKwh} />
            <Flow reverse />
            <Node icon={Zap} label="Inverter" value={inverterKva ? `${inverterKva} kVA` : undefined} active={!!inverterKva} />
          </div>
          <Flow vertical />
          <Node icon={isHome ? Home : Building2} label={isHome ? "Home" : "Business"} active />
        </div>
      </div>
    </motion.div>
  );
}

function PanelIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M4 5h16l2 10H2z" />
      <path d="M8 5l-1 10M16 5l1 10M3 10h18M12 15v4M9 19h6" />
    </svg>
  );
}
