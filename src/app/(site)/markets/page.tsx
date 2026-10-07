import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { MarketCard } from "@/components/site/cards";
import { CTASection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";
import { buildMetadata, getMarkets, getSettings } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/markets",
    title: "Markets — Engineered for the way you live and work",
    description:
      "Residential, commercial, industrial, estates, government & institutions and agriculture — power, security and automation engineered for each.",
  });
}

export default async function MarketsPage() {
  const [markets, settings] = await Promise.all([getMarkets(), getSettings()]);
  return (
    <>
      <PageHero
        title="Engineered for the way you live and work."
        subtitle="A home, a shop, a factory floor or an entire estate: the engineering is different because the demands are different."
        crumbs={[{ label: "Markets" }]}
      />
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {markets.map((m, i) => (
              <Reveal key={m.id} delay={Math.min(i * 0.06, 0.3)}>
                <MarketCard market={m} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>
      <CTASection whatsapp={settings.whatsapp} whatsappMessage={settings.whatsapp_default_message} />
    </>
  );
}
