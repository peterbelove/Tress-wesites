import Link from "next/link";
import { AdminPageHeader, Badge, Table } from "@/components/admin/admin-ui";
import { Notice } from "@/components/admin/form-bits";
import { getServices } from "@/lib/cms";

export default async function ServicesAdmin({ searchParams }: { searchParams: Promise<{ deleted?: string }> }) {
  const { deleted } = await searchParams;
  const services = await getServices({ includeHidden: true });
  return (
    <>
      <AdminPageHeader title="Services" description="Manage service pages, imagery, capabilities, order and homepage visibility." actions={<Link href="/admin/services/new" className="btn-primary py-2 text-sm">New service</Link>} />
      <div className="mb-4"><Notice deleted={deleted} /></div>
      <Table head={["#", "Service", "Slug", "Image", "Visible", "Home", ""]}>
        {services.map((s) => (
          <tr key={s.id}>
            <td className="px-4 py-3 font-mono text-xs text-slate-ink">{s.number}</td>
            <td className="px-4 py-3 font-medium text-navy">{s.title}</td>
            <td className="px-4 py-3 font-mono text-xs text-slate-ink">/services/{s.slug}</td>
            <td className="px-4 py-3">{s.media ? <Badge tone="green">Set</Badge> : <Badge tone="amber">Missing</Badge>}</td>
            <td className="px-4 py-3"><Badge tone={s.visible ? "green" : "amber"}>{s.visible ? "Yes" : "Hidden"}</Badge></td>
            <td className="px-4 py-3"><Badge tone={s.showOnHome ? "navy" : "neutral"}>{s.showOnHome ? "Shown" : "No"}</Badge></td>
            <td className="px-4 py-3 text-right"><Link href={`/admin/services/${s.id}`} className="btn-outline py-1.5 text-xs">Edit</Link></td>
          </tr>
        ))}
      </Table>
    </>
  );
}
