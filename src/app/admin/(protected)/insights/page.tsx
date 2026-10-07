import Link from "next/link";
import { AdminPageHeader, Badge, Table } from "@/components/admin/admin-ui";
import { Notice } from "@/components/admin/form-bits";
import { getInsights } from "@/lib/cms";
import { formatDateShort } from "@/lib/utils";

export default async function InsightsAdmin({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { deleted } = await searchParams;
  const insights = await getInsights({ includeUnpublished: true });
  return (
    <>
      <AdminPageHeader title="Insights" description="Articles, engineering insights, announcements and educational content." actions={<Link href="/admin/insights/new" className="btn-primary py-2 text-sm">New insight</Link>} />
      <div className="mb-4"><Notice deleted={deleted} /></div>
      <Table head={["Title", "Category", "Status", "Featured", "Date", ""]}>
        {insights.map((i) => (
          <tr key={i.id}>
            <td className="px-4 py-3"><Link href={`/admin/insights/${i.id}`} className="font-medium text-navy hover:underline">{i.title}</Link><div className="font-mono text-[10px] text-slate-ink">/insights/{i.slug}</div></td>
            <td className="px-4 py-3 text-slate-ink">{i.category}</td>
            <td className="px-4 py-3"><Badge tone={i.published ? "green" : "amber"}>{i.published ? "Published" : "Draft"}</Badge></td>
            <td className="px-4 py-3">{i.featured ? <Badge tone="navy">Featured</Badge> : <span className="text-xs text-slate-ink">—</span>}</td>
            <td className="px-4 py-3 text-slate-ink">{formatDateShort(i.publishedAt)}</td>
            <td className="px-4 py-3 text-right whitespace-nowrap">
              <a href={`/insights/${i.slug}?preview=1`} target="_blank" className="mr-2 text-xs text-green-700 hover:underline">Preview</a>
              <Link href={`/admin/insights/${i.id}`} className="btn-outline py-1.5 text-xs">Edit</Link>
            </td>
          </tr>
        ))}
        {!insights.length ? <tr><td colSpan={6} className="px-4 py-8 text-center text-slate-ink">No insights yet.</td></tr> : null}
      </Table>
    </>
  );
}
