"use client";

import Link from "next/link";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight, Check, MessageCircle, RotateCcw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { EnergyFlow } from "@/components/calculator/energy-flow";
import { GlassMetric } from "@/components/ui/glass";
import {
  buildWhatsAppMessage,
  computeEstimate,
  type ApplianceDef,
  type ApplianceSelection,
  type CalculatorConfig,
  type CalculatorInputs,
} from "@/lib/calculator";
import { cn, waLink } from "@/lib/utils";

const STORAGE_KEY = "tres-solar-calculator-v1";

const STEPS = [
  { key: "property", short: "Property", label: "Tell us about the property" },
  { key: "appliances", short: "Usage", label: "What do you use?" },
  { key: "backup", short: "Backup", label: "How much backup do you need?" },
  { key: "grid", short: "Grid", label: "What is your grid situation?" },
  { key: "result", short: "Your estimate", label: "Your estimated system" },
];

function defaultInputs(config: CalculatorConfig): CalculatorInputs {
  return {
    location: "",
    propertyType: config.propertyTypes[0] || "Residential",
    monthlyBill: null,
    dailyKwh: null,
    appliances: [],
    backupHours: config.backupOptionsHours[1] ?? 6,
    gridCondition: config.gridConditions[1]?.key ?? config.gridConditions[0]?.key ?? "",
    hasGenerator: null,
  };
}

export function SolarCalculator({
  config,
  appliances,
  whatsappNumber,
}: {
  config: CalculatorConfig;
  appliances: ApplianceDef[];
  whatsappNumber: string;
}) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [inputs, setInputs] = useState<CalculatorInputs>(() => defaultInputs(config));
  const [customBackup, setCustomBackup] = useState(false);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const topRef = useRef<HTMLDivElement>(null);
  const submittedKey = useRef<string>("");

  // Restore inputs so the user never loses progress (after hydration).
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        const raw = sessionStorage.getItem(STORAGE_KEY);
        if (raw) {
          const parsed = JSON.parse(raw) as { inputs: CalculatorInputs; step: number };
          if (parsed?.inputs) setInputs({ ...defaultInputs(config), ...parsed.inputs });
          if (typeof parsed?.step === "number" && parsed.step < STEPS.length - 1) setStep(parsed.step);
        }
      } catch {
        /* ignore */
      }
      setHydrated(true);
    }, 0);
    return () => clearTimeout(t);
  }, [config]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ inputs, step }));
    } catch {
      /* ignore */
    }
  }, [inputs, step, hydrated]);

  const result = useMemo(() => computeEstimate(inputs, config), [inputs, config]);

  const liveDailyKwh = useMemo(
    () => inputs.appliances.reduce((s, a) => s + (a.wattage * a.quantity * a.hours) / 1000, 0),
    [inputs.appliances],
  );
  const liveLoadKw = useMemo(
    () => inputs.appliances.reduce((s, a) => s + (a.wattage * a.quantity) / 1000, 0),
    [inputs.appliances],
  );

  // Record an anonymous submission once per distinct result (for TRES review metrics).
  useEffect(() => {
    if (step !== STEPS.length - 1 || !result) return;
    const key = JSON.stringify([inputs.location, inputs.propertyType, result.solarKw, result.batteryKwh, result.inverterKva]);
    if (submittedKey.current === key) return;
    submittedKey.current = key;
    fetch("/api/calculator/submissions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ inputs, results: result }),
      keepalive: true,
    }).catch(() => undefined);
  }, [step, result, inputs]);

  const go = useCallback(
    (next: number) => {
      setDirection(next > step ? 1 : -1);
      setStep(next);
      setError("");
      requestAnimationFrame(() => topRef.current?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" }));
    },
    [step, reduce],
  );

  const validate = (): string => {
    if (step === 0 && !inputs.propertyType) return "Please choose a property type.";
    if (step === 1 && liveDailyKwh <= 0 && !(inputs.dailyKwh && inputs.dailyKwh > 0) && !(inputs.monthlyBill && inputs.monthlyBill > 0)) {
      return "Select at least one appliance, or go back and enter your daily usage or monthly bill.";
    }
    if (step === 2 && !(inputs.backupHours > 0)) return "Please choose how many hours of backup you need.";
    if (step === 3 && !inputs.gridCondition) return "Please choose your grid condition.";
    return "";
  };

  const next = () => {
    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }
    go(Math.min(step + 1, STEPS.length - 1));
  };
  const back = () => go(Math.max(step - 1, 0));
  const reset = () => {
    setInputs(defaultInputs(config));
    setCustomBackup(false);
    sessionStorage.removeItem(STORAGE_KEY);
    go(0);
  };

  const toggleAppliance = (a: ApplianceDef) => {
    setInputs((prev) => {
      const exists = prev.appliances.find((x) => x.id === a.id);
      if (exists) return { ...prev, appliances: prev.appliances.filter((x) => x.id !== a.id) };
      const sel: ApplianceSelection = { id: a.id, name: a.name, wattage: a.wattage, quantity: a.defaultQuantity, hours: a.defaultHours };
      return { ...prev, appliances: [...prev.appliances, sel] };
    });
  };
  const updateAppliance = (id: number, patch: Partial<ApplianceSelection>) =>
    setInputs((prev) => ({ ...prev, appliances: prev.appliances.map((x) => (x.id === id ? { ...x, ...patch } : x)) }));

  const whatsapp = config.whatsappNumber || whatsappNumber;
  const waMessage = result ? buildWhatsAppMessage(inputs, result) : "";
  const quoteHref = result
    ? `/contact?${new URLSearchParams({
        service: "Renewable Energy",
        property: inputs.propertyType,
        location: inputs.location,
        message: waMessage,
      }).toString()}`
    : "/contact";

  const variants = {
    enter: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * 40 }),
    center: { opacity: 1, x: 0 },
    exit: (d: number) => ({ opacity: 0, x: reduce ? 0 : d * -40 }),
  };

  const chip = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-2 text-sm transition-all",
      active ? "border-green bg-green text-white shadow-[0_8px_24px_-8px_rgba(14,159,88,0.8)]" : "border-white/15 bg-white/5 text-white/80 hover:border-white/40",
    );
  const input = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/40 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green/30";
  const label = "mb-2 block text-xs font-medium tracking-wide text-white/60 uppercase";

  return (
    <div ref={topRef} className="scroll-mt-28">
      {/* Progress */}
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-end gap-2">
          {STEPS.map((s, i) => {
            const done = i < step;
            const current = i === step;
            return (
              <li key={s.key} className="min-w-0 flex-1">
                <button
                  type="button"
                  onClick={() => (i < step ? go(i) : undefined)}
                  disabled={i > step}
                  aria-current={current ? "step" : undefined}
                  className="group w-full text-left disabled:cursor-default"
                >
                  <span
                    className={cn(
                      "mb-2 block truncate text-xs transition-colors",
                      current ? "font-medium text-white" : done ? "text-white/70" : "text-white/35",
                    )}
                  >
                    {s.short}
                  </span>
                  <span className={cn("block h-0.5 rounded-full transition-colors duration-500", done || current ? "bg-green" : "bg-white/15")} />
                </button>
              </li>
            );
          })}
        </ol>
      </nav>
      <div className="mb-6 md:hidden">
        <div className="display text-xl text-white">{STEPS[step].label}</div>
      </div>

      <div className="glass-dark glass-highlight rounded-3xl p-6 md:p-10">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.div
            key={step}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            {step === 0 ? (
              <div className="space-y-8">
                <header className="hidden md:block">
                  <h3 className="display text-2xl text-white">Tell us about the property</h3>
                </header>
                <div>
                  <span className={label}>Property type</span>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Property type">
                    {config.propertyTypes.map((p) => (
                      <button key={p} type="button" role="radio" aria-checked={inputs.propertyType === p} onClick={() => setInputs({ ...inputs, propertyType: p })} className={chip(inputs.propertyType === p)}>
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <div>
                    <label htmlFor="calc-location" className={label}>Location (state)</label>
                    <select id="calc-location" className={input} value={inputs.location} onChange={(e) => setInputs({ ...inputs, location: e.target.value })}>
                      <option value="" className="text-ink">Select a state…</option>
                      {config.locations.map((l) => (
                        <option key={l.name} value={l.name} className="text-ink">{l.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="calc-bill" className={label}>Monthly electricity bill (₦) — optional</label>
                    <input id="calc-bill" type="number" inputMode="numeric" min={0} className={input} placeholder="e.g. 45000" value={inputs.monthlyBill ?? ""} onChange={(e) => setInputs({ ...inputs, monthlyBill: e.target.value ? Number(e.target.value) : null })} />
                  </div>
                  <div>
                    <label htmlFor="calc-daily" className={label}>Daily energy usage (kWh) — optional</label>
                    <input id="calc-daily" type="number" inputMode="decimal" min={0} step="0.1" className={input} placeholder="If you know it" value={inputs.dailyKwh ?? ""} onChange={(e) => setInputs({ ...inputs, dailyKwh: e.target.value ? Number(e.target.value) : null })} />
                  </div>
                </div>
                <p className="text-xs text-white/50">Bill and daily usage are optional. Selecting your appliances in the next step gives the most accurate estimate.</p>
              </div>
            ) : null}

            {step === 1 ? (
              <div className="space-y-6">
                <header className="hidden md:block">
                  <h3 className="display text-2xl text-white">What do you use?</h3>
                  <p className="mt-2 text-sm text-white/60">Select the appliances you need powered. Adjust quantity and hours per day.</p>
                </header>
                <ul className="grid gap-2 md:grid-cols-2">
                  {appliances.map((a) => {
                    const sel = inputs.appliances.find((x) => x.id === a.id);
                    return (
                      <li key={a.id} className={cn("rounded-2xl border p-3 transition-colors", sel ? "border-green/60 bg-green/10" : "border-white/10 bg-white/5")}>
                        <div className="flex items-center justify-between gap-3">
                          <button type="button" onClick={() => toggleAppliance(a)} aria-pressed={!!sel} className="flex flex-1 items-center gap-3 text-left">
                            <span className={cn("flex h-5 w-5 items-center justify-center rounded-md border", sel ? "border-green bg-green" : "border-white/30")}>
                              {sel ? <Check className="h-3.5 w-3.5 text-white" /> : null}
                            </span>
                            <span>
                              <span className="block text-sm font-medium text-white">{a.name}</span>
                              <span className="block font-mono text-[11px] text-white/50">{a.wattage} W</span>
                            </span>
                          </button>
                        </div>
                        {sel ? (
                          <div className="mt-3 grid grid-cols-2 gap-2 pl-8">
                            <label className="text-[11px] text-white/60">
                              Quantity
                              <input type="number" min={1} max={999} className={cn(input, "mt-1 py-2")} value={sel.quantity} onChange={(e) => updateAppliance(a.id, { quantity: Math.max(0, Number(e.target.value)) })} />
                            </label>
                            <label className="text-[11px] text-white/60">
                              Hours / day
                              <input type="number" min={0} max={24} step={0.5} className={cn(input, "mt-1 py-2")} value={sel.hours} onChange={(e) => updateAppliance(a.id, { hours: Math.min(24, Math.max(0, Number(e.target.value))) })} />
                            </label>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
                <div className="grid grid-cols-2 gap-3">
                  <GlassMetric label="Daily energy" value={liveDailyKwh.toFixed(1)} unit="kWh" />
                  <GlassMetric label="Connected load" value={liveLoadKw.toFixed(1)} unit="kW" />
                </div>
              </div>
            ) : null}

            {step === 2 ? (
              <div className="space-y-6">
                <header className="hidden md:block">
                  <h3 className="display text-2xl text-white">How much backup do you need?</h3>
                  <p className="mt-2 text-sm text-white/60">How many hours should the battery carry your essential loads without sun or grid?</p>
                </header>
                <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Backup hours">
                  {config.backupOptionsHours.map((h) => (
                    <button key={h} type="button" role="radio" aria-checked={!customBackup && inputs.backupHours === h} onClick={() => { setCustomBackup(false); setInputs({ ...inputs, backupHours: h }); }} className={chip(!customBackup && inputs.backupHours === h)}>
                      {h} hours
                    </button>
                  ))}
                  <button type="button" role="radio" aria-checked={customBackup} onClick={() => setCustomBackup(true)} className={chip(customBackup)}>Custom</button>
                </div>
                {customBackup ? (
                  <div className="max-w-xs">
                    <label htmlFor="calc-backup" className={label}>Custom backup hours</label>
                    <input id="calc-backup" type="number" min={1} max={72} className={input} value={inputs.backupHours} onChange={(e) => setInputs({ ...inputs, backupHours: Math.max(0, Number(e.target.value)) })} />
                  </div>
                ) : null}
              </div>
            ) : null}

            {step === 3 ? (
              <div className="space-y-8">
                <header className="hidden md:block">
                  <h3 className="display text-2xl text-white">What is your grid situation?</h3>
                </header>
                <div className="grid gap-3 sm:grid-cols-2" role="radiogroup" aria-label="Grid condition">
                  {config.gridConditions.map((g) => {
                    const active = inputs.gridCondition === g.key;
                    return (
                      <button key={g.key} type="button" role="radio" aria-checked={active} onClick={() => setInputs({ ...inputs, gridCondition: g.key })} className={cn("rounded-2xl border p-4 text-left transition-all", active ? "border-green bg-green/10" : "border-white/10 bg-white/5 hover:border-white/30")}>
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-white">{g.label}</span>
                          <span className={cn("h-4 w-4 rounded-full border", active ? "border-green bg-green" : "border-white/30")} />
                        </div>
                        {g.description ? <p className="mt-1 text-xs text-white/60">{g.description}</p> : null}
                      </button>
                    );
                  })}
                </div>
                <div>
                  <span className={label}>Do you currently have a generator?</span>
                  <div className="flex gap-2" role="radiogroup" aria-label="Generator">
                    {[{ v: true, l: "Yes" }, { v: false, l: "No" }].map((o) => (
                      <button key={o.l} type="button" role="radio" aria-checked={inputs.hasGenerator === o.v} onClick={() => setInputs({ ...inputs, hasGenerator: o.v })} className={chip(inputs.hasGenerator === o.v)}>{o.l}</button>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}

            {step === 4 ? (
              <div className="space-y-8">
                {result ? (
                  <>
                    <header>
                      <div className="eyebrow text-green-400">Indicative estimate</div>
                      <h3 className="display mt-1 text-3xl text-white md:text-4xl">{config.labels.resultTitle}</h3>
                      <p className="mt-2 text-sm text-white/60">
                        Based on {result.dailyEnergyKwh} kWh/day{inputs.location ? ` in ${inputs.location}` : ""} at an assumed {result.sunHours} peak sun hours.
                      </p>
                    </header>
                    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                      <GlassMetric label="Solar" value={result.solarKw} unit="kW" />
                      <GlassMetric label="Battery" value={result.batteryKwh} unit="kWh" />
                      <GlassMetric label="Inverter" value={result.inverterKva} unit="kVA" />
                      <GlassMetric label="Estimated backup" value={result.estimatedBackupHours} unit="hours" />
                      <GlassMetric label="Daily generation" value={result.dailyGenerationKwh} unit="kWh" />
                      <GlassMetric label="Solar contribution" value={result.solarContributionPercent} unit="%" />
                    </div>
                    <EnergyFlow solarKw={result.solarKw} batteryKwh={result.batteryKwh} inverterKva={result.inverterKva} propertyType={inputs.propertyType} />
                    <div className="grid gap-3 text-xs text-white/60 sm:grid-cols-3">
                      <div className="rounded-xl border border-white/10 p-3"><span className="block font-mono text-white/40">PEAK LOAD</span>{result.peakLoadKw} kW (after diversity)</div>
                      <div className="rounded-xl border border-white/10 p-3"><span className="block font-mono text-white/40">PANELS</span>≈ {result.panelCount} × {config.panelWatt} W</div>
                      <div className="rounded-xl border border-white/10 p-3"><span className="block font-mono text-white/40">BACKUP TARGET</span>{inputs.backupHours} hours</div>
                    </div>
                    {result.notes.length ? (
                      <ul className="space-y-1 text-xs text-white/60">
                        {result.notes.map((n) => (
                          <li key={n} className="flex gap-2"><span className="text-green-400">—</span>{n}</li>
                        ))}
                      </ul>
                    ) : null}
                    <div className="rounded-3xl border border-green/30 bg-green/10 p-6 md:p-8">
                      <h4 className="display text-2xl text-white md:text-3xl">{config.labels.readyTitle}</h4>
                      <p className="mt-2 text-sm text-white/70">No fixed prices are shown because equipment and project costs fluctuate. Send this estimate to TRES and receive a quotation based on a proper assessment.</p>
                      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                        <Link href={quoteHref} className="btn-primary">{config.labels.quoteCta} <ArrowRight className="h-4 w-4" /></Link>
                        {whatsapp ? (
                          <a href={waLink(whatsapp, waMessage)} target="_blank" rel="noopener noreferrer" className="btn-glass"><MessageCircle className="h-4 w-4" /> {config.labels.whatsappCta}</a>
                        ) : null}
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed text-white/50">{config.disclaimer}</p>
                  </>
                ) : (
                  <div className="text-center">
                    <h3 className="display text-2xl text-white">We need a little more information.</h3>
                    <p className="mt-2 text-sm text-white/60">Select at least one appliance or enter your daily usage or monthly bill to produce an estimate.</p>
                    <button type="button" onClick={() => go(1)} className="btn-primary mt-6">Select appliances</button>
                  </div>
                )}
              </div>
            ) : null}
          </motion.div>
        </AnimatePresence>

        {error ? <p role="alert" className="mt-6 rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}

        {/* Controls */}
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-white/10 pt-6">
          <button type="button" onClick={back} disabled={step === 0} className="btn-outline-light disabled:opacity-30"><ArrowLeft className="h-4 w-4" /> Back</button>
          {step < STEPS.length - 1 ? (
            <button type="button" onClick={next} className="btn-primary">{step === STEPS.length - 2 ? "See my estimate" : "Next"} <ArrowRight className="h-4 w-4" /></button>
          ) : (
            <button type="button" onClick={reset} className="btn-outline-light"><RotateCcw className="h-4 w-4" /> Start again</button>
          )}
        </div>
      </div>
    </div>
  );
}
