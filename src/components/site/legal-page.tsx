import { PageHero } from "@/components/site/page-hero";
import { RichText } from "@/components/site/rich-text";
import { getSections, getSettings } from "@/lib/cms";
import { formatDate } from "@/lib/utils";

export async function LegalPage({ page, crumb }: { page: string; crumb: string }) {
  const [sections, settings] = await Promise.all([getSections(page), getSettings()]);
  const content = sections.content;
  return (
    <>
      <PageHero
        title={content?.title || crumb.toUpperCase()}
        subtitle={content?.subtitle}
        crumbs={[{ label: crumb }]}
        compact
      />
      <section className="bg-white">
        <div className="mx-auto max-w-3xl px-6 py-16 md:py-24">
          {content?.body ? <RichText content={content.body} /> : <p className="text-slate-ink">Content will be published shortly.</p>}
          <div className="mt-12 border-t border-navy/10 pt-6 text-xs text-slate-ink">
            <p>{settings.legal_name} · {settings.rc_number}</p>
            {content?.updatedAt ? <p className="mt-1">Last updated {formatDate(content.updatedAt)}</p> : null}
          </div>
        </div>
      </section>
    </>
  );
}
