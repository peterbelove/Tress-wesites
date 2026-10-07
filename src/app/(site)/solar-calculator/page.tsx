import type { Metadata } from "next";
import { SolarCalculator } from "@/components/calculator/solar-calculator";
import { Reveal } from "@/components/motion/reveal";
import { Breadcrumbs } from "@/components/site/breadcrumbs";
import { CTASection } from "@/components/site/cta-section";
import { buildMetadata, getCalculatorConfig, getSettings } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  const { config } = await getCalculatorConfig();
  return buildMetadata({
    path: "/solar-calculator",
    title: "Solar Calculator — How much solar power do you need?",
    description: config.labels.subtitle,
  });
}

export default async function SolarCalculatorPage() {
  const [{ config, appliances }, settings] = await Promise.all([getCalculatorConfig(), getSettings()]);
  return (
    <>
      <section className="relative isolate overflow-hidden bg-navy-950 text-white">
        <div className="grid-lines-dark absolute inset-0 -z-10 opacity-50" aria-hidden />
        <div className="absolute -top-40 right-0 -z-10 h-[36rem] w-[36rem] rounded-full bg-green/15 blur-3xl" aria-hidden />
        <div className="absolute bottom-0 left-0 -z-10 h-[28rem] w-[28rem] -translate-x-1/3 rounded-full bg-navy-500/30 blur-3xl" aria-hidden />
        <div className="mx-auto max-w-7xl px-6 pt-36 pb-20 md:pt-44 md:pb-28">
          <Reveal y={10} className="mb-8">
            <Breadcrumbs items={[{ label: "Solar Calculator" }]} tone="dark" />
          </Reveal>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <Reveal>
                <h1 className="display text-4xl leading-[1.02] md:text-5xl">{config.labels.title}</h1>
                <p className="mt-6 text-lg leading-relaxed text-white/70">{config.labels.subtitle}</p>
                <div className="glass-dark mt-8 rounded-2xl p-5 text-sm text-white/70">
                  <span className="eyebrow block text-green-400">Planning estimate</span>
                  <p className="mt-2">This is a planning estimate. It is not a substitute for professional engineering design or site assessment.</p>
                </div>
                <ul className="mt-8 divide-y divide-white/10 border-y border-white/10 text-sm text-white/70">
                  {["Tell us about the property", "Select what you use", "Choose your backup hours", "Describe your grid situation", "Review your estimated system"].map((step) => (
                    <li key={step} className="flex items-center gap-3 py-3">
                      <span className="h-px w-4 shrink-0 bg-green-400" aria-hidden />
                      {step}
                    </li>
                  ))}
                </ul>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <Reveal delay={0.15}>
                <SolarCalculator config={config} appliances={appliances} whatsappNumber={settings.whatsapp} />
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-10 md:grid-cols-3">
            {[
              { t: "Solar capacity", d: "Sized so the array can generate your daily energy over the useful sun hours at your location, after real-world system losses and a design margin." },
              { t: "Battery capacity", d: "Sized from the loads you keep running during an outage, for the hours you choose, using usable capacity rather than the nominal label." },
              { t: "Inverter capacity", d: "Sized from your peak load with headroom for motor start-up, and checked against the solar array so the inverter can carry the system." },
            ].map((x, i) => (
              <Reveal key={x.t} delay={i * 0.08}>
                <div className="h-px w-10 bg-green" aria-hidden />
                <h2 className="display mt-5 text-xl text-navy">{x.t}</h2>
                <p className="mt-2 text-sm leading-relaxed text-slate-ink">{x.d}</p>
              </Reveal>
            ))}
          </div>
          <p className="mt-12 max-w-3xl text-xs leading-relaxed text-slate-ink/80">{config.disclaimer}</p>
        </div>
      </section>
      <CTASection
        title="PREFER TO TALK IT THROUGH?"
        body="A TRES engineer can review your needs and arrange a site assessment."
        secondaryLabel=""
        whatsapp={settings.whatsapp}
        whatsappMessage="Hello TRES, I would like help sizing a solar system."
      />
    </>
  );
}
