import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/components/motion/reveal";
import { InsightCard } from "@/components/site/cards";
import { CTASection } from "@/components/site/cta-section";
import { MediaImage } from "@/components/site/media-renderer";
import { PageHero } from "@/components/site/page-hero";
import { buildMetadata, getInsights, getSettings } from "@/lib/cms";
import { cn, formatDate } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/insights",
    title: "Insights — Engineering advice, plainly explained",
    description: "Practical guidance on solar, battery storage, electrical engineering, security, automation and energy reliability.",
  });
}

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ category?: string }> }) {
  const { category } = await searchParams;
  const [all, settings] = await Promise.all([getInsights(), getSettings()]);
  const categories = [...new Set(all.map((i) => i.category).filter(Boolean))];
  const active = category && categories.includes(category) ? category : null;
  const list = active ? all.filter((i) => i.category === active) : all;
  const featured = !active ? (all.find((i) => i.featured) ?? all[0]) : null;
  const grid = featured ? list.filter((i) => i.id !== featured.id) : list;

  return (
    <>
      <PageHero
        title="ENGINEERING ADVICE, PLAINLY EXPLAINED."
        subtitle="Practical guidance on solar, storage, electrical systems, security and automation — written to help you make better decisions."
        crumbs={[{ label: "Insights" }]}
        compact
      />

      {featured ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 pt-20 md:pt-28">
            <Reveal>
              <Link href={`/insights/${featured.slug}`} className="group grid gap-10 lg:grid-cols-12 lg:items-center">
                <div className="aspect-[16/10] overflow-hidden rounded-3xl lg:col-span-7">
                  <MediaImage
                    media={featured.cover}
                    className="h-full w-full"
                    imgClassName="transition-transform duration-[1600ms] ease-out group-hover:scale-[1.03]"
                    sizes="(min-width: 1024px) 60vw, 100vw"
                    priority
                    fallbackLabel={featured.category}
                  />
                </div>
                <div className="lg:col-span-5">
                  <div className="eyebrow text-green-700">Featured · {featured.category}</div>
                  <h2 className="display mt-4 text-3xl leading-tight text-navy md:text-4xl">{featured.title}</h2>
                  <p className="mt-5 text-lg leading-relaxed text-slate-ink">{featured.excerpt}</p>
                  <div className="mt-6 flex items-center gap-4 text-sm text-slate-ink">
                    <time dateTime={new Date(featured.publishedAt).toISOString()}>{formatDate(featured.publishedAt)}</time>
                    <span className="inline-flex items-center gap-1.5 font-medium text-navy">
                      <span className="border-b border-navy/20 pb-0.5 transition-colors group-hover:border-green">Read article</span>
                      <ArrowUpRight className="h-4 w-4" />
                    </span>
                  </div>
                </div>
              </Link>
            </Reveal>
          </div>
        </section>
      ) : null}

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          {categories.length > 1 ? (
            <nav aria-label="Categories" className="mb-14 flex flex-wrap gap-x-8 gap-y-3 border-b border-navy/10 pb-5 text-sm">
              <Link href="/insights" className={cn("pb-0.5", !active ? "border-b-2 border-green font-medium text-navy" : "text-slate-ink hover:text-navy")}>
                All
              </Link>
              {categories.map((c) => (
                <Link
                  key={c}
                  href={`/insights?category=${encodeURIComponent(c)}`}
                  className={cn("pb-0.5", active === c ? "border-b-2 border-green font-medium text-navy" : "text-slate-ink hover:text-navy")}
                >
                  {c}
                </Link>
              ))}
            </nav>
          ) : null}
          {grid.length ? (
            <Stagger className="grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {grid.map((i) => (
                <StaggerItem key={i.id}>
                  <InsightCard insight={i} />
                </StaggerItem>
              ))}
            </Stagger>
          ) : !featured ? (
            <div className="rounded-3xl border border-navy/10 p-12 text-center">
              <h2 className="display text-2xl text-navy">Insights are on their way.</h2>
              <p className="mt-2 text-slate-ink">New articles will appear here as they are published.</p>
            </div>
          ) : null}
        </div>
      </section>

      <CTASection
        title="HAVE A QUESTION ABOUT YOUR OWN SYSTEM?"
        body="A TRES engineer can review your situation and advise on the right approach."
        secondaryLabel="Calculate Your Solar System"
        secondaryHref="/solar-calculator"
        whatsapp={settings.whatsapp}
        whatsappMessage={settings.whatsapp_default_message}
      />
    </>
  );
}
