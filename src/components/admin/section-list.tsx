import Link from "next/link";
import { Badge, Table } from "@/components/admin/admin-ui";
import type { SectionRow } from "@/db/schema";
import { formatDateShort, truncate } from "@/lib/utils";

export function SectionList({ sections, title }: { sections: SectionRow[]; title?: string }) {
  return (
    <section>
      {title ? <h2 className="display mb-3 text-lg text-navy">{title}</h2> : null}
      <Table head={["Section", "Title", "Visible", "Updated", ""]}>
        {sections.map((s) => (
          <tr key={s.id}>
            <td className="px-4 py-3">
              <div className="font-medium text-navy">{s.label || s.key}</div>
              <div className="font-mono text-[10px] text-slate-ink">{s.page}/{s.key}</div>
            </td>
            <td className="px-4 py-3 text-slate-ink">{truncate(s.title.replace(/\n/g, " "), 60) || "—"}</td>
            <td className="px-4 py-3"><Badge tone={s.visible ? "green" : "amber"}>{s.visible ? "Visible" : "Hidden"}</Badge></td>
            <td className="px-4 py-3 text-slate-ink">{formatDateShort(s.updatedAt)}</td>
            <td className="px-4 py-3 text-right"><Link href={`/admin/sections/${s.id}`} className="btn-outline py-1.5 text-xs">Edit</Link></td>
          </tr>
        ))}
      </Table>
    </section>
  );
}
