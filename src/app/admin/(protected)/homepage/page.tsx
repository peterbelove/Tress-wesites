import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { SectionList } from "@/components/admin/section-list";
import { getSectionRows } from "@/lib/cms";

export default async function HomepageAdmin() {
  const sections = await getSectionRows("home");
  return (
    <>
      <AdminPageHeader
        title="Homepage"
        description="The homepage is an introduction and conversion experience: Hero → Customer Problem → Engineering Should Improve Lives → Services Preview → Featured Projects → Solar Calculator Promo → Final CTA. Deeper content lives on its dedicated page."
        actions={
          <>
            <Link href="/admin/services" className="btn-outline py-2 text-sm">Services preview order</Link>
            <Link href="/admin/projects" className="btn-outline py-2 text-sm">Featured projects</Link>
            <Link href="/" target="_blank" className="btn-navy py-2 text-sm">View homepage</Link>
          </>
        }
      />
      <SectionList sections={sections} />
      <p className="mt-4 text-xs text-slate-ink">
        Featured projects are chosen with the “Featured on homepage” flag in Projects (up to four, in display order). Service cards follow the order and “Show on homepage” setting in Services. Markets, the engineering process, Why TRES, the founder message and Insights are managed on their own pages.
      </p>
    </>
  );
}
