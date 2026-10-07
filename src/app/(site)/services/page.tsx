import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { ServiceCard } from "@/components/site/cards";
import { CTASection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";
import { buildMetadata, getServices, getSettings } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/services",
    title: "What We Engineer — Services",
    description:
      "Renewable energy, electrical engineering & power, smart security, smart automation, procurement & supply and project management — delivered through a single point of contact.",
  });
}

export default async function ServicesPage() {
  const [services, settings] = await Promise.all([getServices(), getSettings()]);
  return (
    <>
      <PageHero
        title="WHAT WE ENGINEER"
        subtitle="Six connected disciplines, delivered through a single point of contact — so the system you end up with works as one."
        crumbs={[{ label: "Services" }]}
      />
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-4 md:grid-cols-6">
            {services.map((s, i) => {
              const span = ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4", "md:col-span-3", "md:col-span-3"][i % 6];
              const feature = i % 6 === 0 || i % 6 === 3;
              return (
                <Reveal key={s.id} delay={Math.min(i * 0.06, 0.3)} className={span}>
                  <ServiceCard service={s} variant={feature ? "feature" : "standard"} className="h-full min-h-[22rem]" />
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>
      <CTASection whatsapp={settings.whatsapp} whatsappMessage={settings.whatsapp_default_message} />
    </>
  );
}
