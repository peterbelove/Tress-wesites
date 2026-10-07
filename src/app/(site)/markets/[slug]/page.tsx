import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { MarketCard, ProjectCard } from "@/components/site/cards";
import { CTASection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { buildMetadata, getMarketBySlug, getMarkets, getProjects, getServices, getSettings } from "@/lib/cms";
import { splitParagraphs } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const market = await getMarketBySlug(slug);
  if (!market) return { title: "Market not found" };
  return buildMetadata({
    path: `/markets/${slug}`,
    title: market.seoTitle || `${market.title} — ${market.headline}`,
    description: market.seoDescription || market.summary,
    image: market.media,
  });
}

export default async function MarketPage({ params }: Props) {
  const { slug } = await params;
  const market = await getMarketBySlug(slug);
  if (!market) notFound();
  const [settings, markets, services, projects] = await Promise.all([getSettings(), getMarkets(), getServices(), getProjects({ limit: 3 })]);
  const others = markets.filter((m) => m.id !== market.id);
  const contactHref = `/contact?property=${encodeURIComponent(market.title)}`;

  return (
    <>
      <PageHero
        title={market.headline || market.title}
        subtitle={market.summary}
        media={market.media}
        crumbs={[{ label: "Markets", href: "/markets" }, { label: market.title }]}
      >
        <div className="flex flex-wrap gap-3">
          <Link href={contactHref} className="btn-primary">{market.ctaLabel || "Talk to TRES"} <ArrowRight className="h-4 w-4" /></Link>
          <Link href="/solar-calculator" className="btn-glass">Calculate Your Solar System</Link>
        </div>
      </PageHero>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <div className="space-y-5">
                  {splitParagraphs(market.description).map((p, i) => (
                    <p key={i} className={i === 0 ? "display text-2xl leading-snug text-navy md:text-3xl" : "text-lg leading-relaxed text-slate-ink"}>{p}</p>
                  ))}
                </div>
              </Reveal>
              {market.painPoints?.length ? (
                <Stagger className="mt-12">
                  <div className="eyebrow mb-4 text-slate-ink">What you are dealing with</div>
                  <ul className="grid gap-x-10 sm:grid-cols-2">
                    {market.painPoints.map((p) => (
                      <StaggerItem key={p} as="li" className="flex items-center gap-3 border-b border-navy/10 py-3 text-navy">
                        <span className="h-px w-4 shrink-0 bg-green" aria-hidden />
                        {p}
                      </StaggerItem>
                    ))}
                  </ul>
                </Stagger>
              ) : null}
            </div>
            <div className="lg:col-span-5">
              <Reveal delay={0.15} className="rounded-3xl bg-navy p-8 text-white">
                <div className="text-sm font-medium text-white/80">How TRES responds</div>
                <ul className="mt-6 divide-y divide-white/10">
                  {(market.solutions || []).map((s, i) => (
                    <li key={i} className="py-4 first:pt-0">
                      <h3 className="display text-lg">{s.title}</h3>
                      {s.text ? <p className="mt-1 text-sm text-white/65">{s.text}</p> : null}
                    </li>
                  ))}
                </ul>
                <div className="mt-8 border-t border-white/10 pt-5">
                  <div className="mb-3 text-sm font-medium text-white/80">Related services</div>
                  <ul className="flex flex-wrap gap-x-6 gap-y-2">
                    {services.slice(0, 4).map((s) => (
                      <li key={s.id}>
                        <Link href={`/services/${s.slug}`} className="text-sm text-white/80 underline-offset-4 hover:text-white hover:underline">{s.shortTitle || s.title}</Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {projects.length ? (
        <section className="bg-mist">
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
            <SectionHeading title="ENGINEERING, IN THE REAL WORLD." action={{ label: "All projects", href: "/projects" }} />
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {others.length ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-24">
            <h2 className="display mb-8 text-xl text-navy">Other markets</h2>
            <div className="-mx-6 flex snap-x gap-4 overflow-x-auto px-6 pb-4 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
              {others.map((m) => (
                <div key={m.id} className="w-[70vw] shrink-0 snap-start sm:w-64 md:w-auto">
                  <MarketCard market={m} />
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CTASection
        primaryLabel={market.ctaLabel || "Talk to TRES"}
        primaryHref={contactHref}
        whatsapp={settings.whatsapp}
        whatsappMessage={`Hello TRES, I would like to discuss a ${market.title.toLowerCase()} project.`}
      />
    </>
  );
}
