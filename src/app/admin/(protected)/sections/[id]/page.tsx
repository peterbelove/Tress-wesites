import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Notice } from "@/components/admin/form-bits";
import { SectionEditor } from "@/components/admin/section-editor";
import { getMediaMap, getSectionById } from "@/lib/cms";

export default async function SectionEditPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const section = await getSectionById(parseInt(id, 10));
  if (!section) notFound();
  const media = await getMediaMap([section.mediaId, section.mobileMediaId, section.videoMediaId, section.mobileVideoMediaId, section.posterMediaId]);
  const back = section.page === "home" ? "/admin/homepage" : "/admin/about";
  const pagePath = section.page === "home" ? "/" : `/${section.page}`;
  return (
    <>
      <AdminPageHeader
        title={section.label || section.key}
        description={`${section.page} page · section “${section.key}”`}
        backHref={back}
        backLabel={section.page === "home" ? "Homepage" : "About & Legal"}
        actions={<a href={pagePath} target="_blank" className="btn-outline py-2 text-sm">View page</a>}
      />
      <div className="mb-6"><Notice saved={saved} /></div>
      <SectionEditor section={section} media={media} />
    </>
  );
}
