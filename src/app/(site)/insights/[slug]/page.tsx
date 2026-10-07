import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Reveal } from "@/components/motion/reveal";
import { InsightCard } from "@/components/site/cards";
import { CTASection } from "@/components/site/cta-section";
import { MediaImage } from "@/components/site/media-renderer";
import { PageHero } from "@/components/site/page-hero";
import { RichText } from "@/components/site/rich-text";
import { SectionHeading } from "@/components/site/section-heading";
import { getAdminUser } from "@/lib/auth";
import { buildMetadata, getInsightBySlug, getInsights, getSettings } from "@/lib/cms";
import { formatDate } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const insight = await getInsightBySlug(slug);
  if (!insight) return { title: "Insight not found" };
  return buildMetadata({
    path: `/insights/${slug}`,
    title: insight.seoTitle || insight.title,
    description: insight.seoDescription || insight.excerpt,
    image: insight.cover,
  });
}

export default async function InsightPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const admin = preview ? await getAdminUser() : null;
  const insight = await getInsightBySlug(slug, Boolean(admin));
  if (!insight) notFound();
  const [settings, all] = await Promise.all([getSettings(), getInsights({ limit: 4 })]);
  const related = all.filter((i) => i.id !== insight.id).slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: insight.title,
    description: insight.excerpt,
    datePublished: new Date(insight.publishedAt).toISOString(),
    dateModified: new Date(insight.updatedAt).toISOString(),
    image: insight.cover?.url,
    author: { "@type": "Organization", name: settings.brand_name },
    publisher: { "@type": "Organization", name: settings.brand_name, legalName: settings.legal_name },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {!insight.published ? (
        <div className="fixed inset-x-0 top-0 z-[60] bg-green px-4 py-1.5 text-center text-xs font-medium text-white">Preview — this insight is not published</div>
      ) : null}
      <PageHero
        title={insight.title}
        meta={`${insight.category} · ${formatDate(insight.publishedAt)}`}
        subtitle={insight.excerpt}
        crumbs={[{ label: "Insights", href: "/insights" }, { label: insight.title }]}
        compact
      />
      <article className="bg-white">
        <div className="mx-auto max-w-7xl px-6">
          {insight.cover ? (
            <Reveal className="-mt-8 overflow-hidden rounded-3xl md:-mt-12">
              <MediaImage media={insight.cover} className="aspect-[21/9] w-full" priority sizes="(min-width: 1280px) 1200px, 100vw" />
            </Reveal>
          ) : null}
        </div>
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          <RichText content={insight.content} className="text-lg" />
          <div className="mt-12 rounded-2xl border border-navy/10 bg-mist p-6 text-sm text-slate-ink">
            This article is general guidance from {settings.brand_name}. Every site is different — final decisions should follow a professional assessment and engineering design.
          </div>
        </div>
      </article>
      {related.length ? (
        <section className="bg-mist">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <SectionHeading title="MORE INSIGHTS." action={{ label: "All insights", href: "/insights" }} />
            <div className="mt-12 grid gap-x-6 gap-y-12 md:grid-cols-3">
              {related.map((i) => (
                <InsightCard key={i.id} insight={i} />
              ))}
            </div>
          </div>
        </section>
      ) : null}
      <CTASection whatsapp={settings.whatsapp} whatsappMessage={settings.whatsapp_default_message} />
    </>
  );
}
