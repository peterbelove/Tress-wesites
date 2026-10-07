import Link from "next/link";
import { AdminPageHeader, Badge, Table } from "@/components/admin/admin-ui";
import { Notice } from "@/components/admin/form-bits";
import { getMarkets } from "@/lib/cms";

export default async function MarketsAdmin({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { deleted } = await searchParams;
  const markets = await getMarkets({ includeHidden: true });
  return (
    <>
      <AdminPageHeader title="Markets" description="Manage market pages, headlines, pain points, imagery, order and homepage visibility." actions={<Link href="/admin/markets/new" className="btn-primary py-2 text-sm">New market</Link>} />
      <div className="mb-4"><Notice deleted={deleted} /></div>
      <Table head={["Market", "Headline", "Image", "Visible", "Home", ""]}>
        {markets.map((m) => (
          <tr key={m.id}>
            <td className="px-4 py-3 font-medium text-navy">{m.title}<div className="font-mono text-[10px] text-slate-ink">/markets/{m.slug}</div></td>
            <td className="px-4 py-3 text-slate-ink">{m.headline}</td>
            <td className="px-4 py-3">{m.media ? <Badge tone="green">Set</Badge> : <Badge tone="amber">Missing</Badge>}</td>
            <td className="px-4 py-3"><Badge tone={m.visible ? "green" : "amber"}>{m.visible ? "Yes" : "Hidden"}</Badge></td>
            <td className="px-4 py-3"><Badge tone={m.showOnHome ? "navy" : "neutral"}>{m.showOnHome ? "Shown" : "No"}</Badge></td>
            <td className="px-4 py-3 text-right"><Link href={`/admin/markets/${m.id}`} className="btn-outline py-1.5 text-xs">Edit</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
