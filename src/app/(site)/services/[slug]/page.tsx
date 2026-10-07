import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { CTASection } from "@/components/site/cta-section";
import { MediaImage, MediaVideo } from "@/components/site/media-renderer";
import { PageHero } from "@/components/site/page-hero";
import { ProcessFlow } from "@/components/site/process-flow";
import { SectionHeading } from "@/components/site/section-heading";
import { buildMetadata, getMarkets, getServiceBySlug, getServices, getSettings } from "@/lib/cms";
import { splitParagraphs } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) return { title: "Service not found" };
  return buildMetadata({
    path: `/services/${slug}`,
    title: service.seoTitle || service.title,
    description: service.seoDescription || service.summary,
    image: service.media,
  });
}

export default async function ServicePage({ params }: Props) {
  const { slug } = await params;
  const service = await getServiceBySlug(slug);
  if (!service) notFound();
  const [settings, services, markets] = await Promise.all([getSettings(), getServices(), getMarkets()]);
  const others = services.filter((s) => s.id !== service.id);
  const isProcess = service.slug === "project-management";

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: service.title,
    description: service.summary,
    provider: { "@type": "Organization", name: settings.brand_name, legalName: settings.legal_name },
    areaServed: "NG",
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageHero
        title={service.headline || service.title}
        subtitle={service.summary}
        media={service.media}
        crumbs={[{ label: "Services", href: "/services" }, { label: service.title }]}
      >
        <div className="flex flex-wrap gap-3">
          <Link href={`/contact?service=${encodeURIComponent(service.title)}`} className="btn-primary">
            Talk to TRES <ArrowRight className="h-4 w-4" />
          </Link>
          {service.slug === "renewable-energy" ? (
            <Link href="/solar-calculator" className="btn-glass">Calculate Your Solar System</Link>
          ) : null}
        </div>
      </PageHero>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="grid gap-14 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Reveal>
                <div className="space-y-5">
                  {splitParagraphs(service.description).map((p, i) => (
                    <p key={i} className={i === 0 ? "display text-2xl leading-snug text-navy md:text-3xl" : "text-lg leading-relaxed text-slate-ink"}>{p}</p>
                  ))}
                </div>
              </Reveal>
              {service.outcomes?.length ? (
                <Stagger className="mt-12 grid gap-4 sm:grid-cols-3">
                  {service.outcomes.map((o, i) => (
                    <StaggerItem key={i} className="rounded-2xl border border-navy/10 p-5">
                      <div className="h-1 w-8 rounded-full bg-green" />
                      <h3 className="display mt-4 text-lg text-navy">{o.title}</h3>
                      {o.text ? <p className="mt-2 text-sm leading-relaxed text-slate-ink">{o.text}</p> : null}
                    </StaggerItem>
                  ))}
                </Stagger>
              ) : null}
            </div>
            <aside className="lg:col-span-5">
              <Reveal delay={0.15} className="lg:sticky lg:top-32">
                <div className="rounded-3xl bg-navy p-8 text-white">
                  <div className="text-sm font-medium text-white/80">Capabilities</div>
                  <ul className="mt-5 divide-y divide-white/10">
                    {service.capabilities.map((c) => (
                      <li key={c} className="flex items-center gap-4 py-3">
                        <span className="h-px w-4 shrink-0 bg-green-400" aria-hidden />
                        <span className="text-sm">{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>

      {isProcess && service.capabilities.length ? (
        <section className="grid-lines bg-mist">
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
            <SectionHeading title="Planning to support, coordinated by one team." />
            <div className="mt-16">
              <ProcessFlow steps={service.capabilities.map((c) => ({ title: c, text: "" }))} />
            </div>
          </div>
        </section>
      ) : null}

      {service.video ? (
        <section className="bg-navy-950">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="aspect-video overflow-hidden rounded-3xl">
              <MediaVideo media={service.video} poster={service.media} controls autoPlay={false} />
            </div>
          </div>
        </section>
      ) : null}

      {markets.length ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
            <SectionHeading title="Engineered for the way you live and work." action={{ label: "Explore markets", href: "/markets" }} />
            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {markets.map((m) => (
                <Link key={m.id} href={`/markets/${m.slug}`} className="group relative flex h-40 items-end overflow-hidden rounded-2xl bg-navy-900 p-5 text-white">
                  <MediaImage media={m.media} className="absolute inset-0 h-full w-full" imgClassName="transition-transform duration-[1200ms] group-hover:scale-105" sizes="33vw" />
                  <div className="absolute inset-0 bg-gradient-to-t from-navy-950/90 to-navy-950/20" />
                  <span className="display relative text-lg">{m.title}</span>
                  <ArrowUpRight className="relative ml-auto h-4 w-4" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {others.length ? (
        <section className="border-t border-navy/10 bg-white">
          <div className="mx-auto max-w-7xl px-6 py-16">
            <h2 className="display mb-6 text-xl text-navy">Other services</h2>
            <ul className="flex flex-wrap gap-x-8 gap-y-3">
              {others.map((o) => (
                <li key={o.id}>
                  <Link href={`/services/${o.slug}`} className="group inline-flex items-center gap-1.5 text-sm font-medium text-navy hover:text-green-700">
                    <span className="border-b border-navy/20 pb-0.5 group-hover:border-green">{o.title}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      ) : null}

      <CTASection whatsapp={settings.whatsapp} whatsappMessage={`Hello TRES, I would like to discuss ${service.title}.`} />
    </>
  );
}
