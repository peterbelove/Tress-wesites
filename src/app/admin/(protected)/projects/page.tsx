import Link from "next/link";
import { AdminPageHeader, Badge, Table } from "@/components/admin/admin-ui";
import { Notice, SubmitButton } from "@/components/admin/form-bits";
import { toggleProjectPublishedAction } from "@/lib/admin-actions";
import { getProjects } from "@/lib/cms";
import { formatDateShort, isPlaceholderCover } from "@/lib/utils";

export default async function ProjectsAdmin({ searchParams }: { searchParams: Promise<{ deleted?: string; saved?: string }> }) {
  const { deleted, saved } = await searchParams;
  const projects = await getProjects({ includeUnpublished: true });
  return (
    <>
      <AdminPageHeader
        title="Projects"
        description="Create, edit, publish and feature projects. Featured + published projects appear on the homepage in display order."
        actions={<Link href="/admin/projects/new" className="btn-primary py-2 text-sm">New project</Link>}
      />
      <div className="mb-4"><Notice deleted={deleted} saved={saved} /></div>
      <Table head={["Project", "Location", "System", "Status", "Featured", "Updated", ""]}>
        {projects.map((p) => (
          <tr key={p.id}>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-14 shrink-0 overflow-hidden rounded-md bg-mist">
                  {p.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.cover.thumbnailUrl || p.cover.url} alt="" className="h-full w-full object-cover" loading="lazy" />
                  ) : null}
                </div>
                <div>
                  <Link href={`/admin/projects/${p.id}`} className="font-medium text-navy hover:underline">{p.title}</Link>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="font-mono text-[10px] text-slate-ink">{p.category || "—"}</span>
                    {isPlaceholderCover(p.cover) ? <Badge tone="amber">Unverified photo</Badge> : null}
                  </div>
                </div>
              </div>
            </td>
            <td className="px-4 py-3 text-slate-ink">{p.location || "—"}</td>
            <td className="px-4 py-3 font-mono text-xs text-slate-ink">{[p.systemCapacity, p.energyCapacity].filter(Boolean).join(" + ") || "—"}</td>
            <td className="px-4 py-3">
              <form action={toggleProjectPublishedAction} className="flex items-center gap-2">
                <input type="hidden" name="id" value={p.id} />
                <input type="hidden" name="published" value={p.published ? "false" : "true"} />
                <input type="hidden" name="_return" value="/admin/projects" />
                <Badge tone={p.published ? "green" : "amber"}>{p.published ? "Published" : "Draft"}</Badge>
                <SubmitButton variant="outline" className="px-3 py-1 text-[11px]">{p.published ? "Unpublish" : "Publish"}</SubmitButton>
              </form>
            </td>
            <td className="px-4 py-3">{p.featured ? <Badge tone="navy">Featured</Badge> : <span className="text-xs text-slate-ink">—</span>}</td>
            <td className="px-4 py-3 text-slate-ink">{formatDateShort(p.updatedAt)}</td>
            <td className="px-4 py-3 text-right whitespace-nowrap">
              <a href={`/projects/${p.slug}?preview=1`} target="_blank" className="mr-2 text-xs text-green-700 hover:underline">Preview</a>
              <Link href={`/admin/projects/${p.id}`} className="btn-outline py-1.5 text-xs">Edit</Link>
            </td>
          </tr>
        ))}
        {!projects.length ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-ink">No projects yet. Create the first one.</td></tr> : null}
      </Table>
    </>
  );
}
