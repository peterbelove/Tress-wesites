import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { enquiries } from "@/db/schema";
import { AdminPageHeader, Badge } from "@/components/admin/admin-ui";
import { Notice, Select, SubmitButton, Textarea } from "@/components/admin/form-bits";
import { deleteEnquiryAction, updateEnquiryAction } from "@/lib/admin-actions";
import { cn, formatDate, waLink } from "@/lib/utils";

const STATUSES = ["new", "contacted", "qualified", "closed"] as const;
const tone: Record<string, "green" | "navy" | "amber" | "neutral"> = { new: "green", contacted: "navy", qualified: "amber", closed: "neutral" };

export default async function EnquiriesAdmin({ searchParams }: { searchParams: Promise<{ status?: string; saved?: string; deleted?: string }> }) {
  const { status = "all", saved, deleted } = await searchParams;
  const rows = await db
    .select()
    .from(enquiries)
    .where(status !== "all" && (STATUSES as readonly string[]).includes(status) ? eq(enquiries.status, status) : undefined)
    .orderBy(desc(enquiries.createdAt));
  return (
    <>
      <AdminPageHeader title="Enquiries" description="Contact form submissions. Track each enquiry from New to Closed and keep internal notes." />
      <div className="mb-6 flex flex-wrap gap-1 rounded-full border border-navy/10 bg-white p-1 text-sm">
        {["all", ...STATUSES].map((s) => (
          <Link key={s} href={`/admin/enquiries?status=${s}`} className={cn("rounded-full px-4 py-1.5 capitalize", status === s ? "bg-navy text-white" : "text-navy hover:bg-navy/5")}>{s}</Link>
        ))}
      </div>
      <div className="mb-6"><Notice saved={saved} deleted={deleted} /></div>
      <div className="space-y-4">
        {rows.map((e) => (
          <article key={e.id} className="card-admin">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="display text-lg text-navy">{e.name}</h2>
                  <Badge tone={tone[e.status] ?? "neutral"}>{e.status}</Badge>
                  <span className="text-xs text-slate-ink">{e.source}</span>
                </div>
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-ink">
                  {e.phone ? <a href={`tel:${e.phone}`} className="hover:text-navy">{e.phone}</a> : null}
                  {e.whatsapp || e.phone ? <a href={waLink(e.whatsapp || e.phone)} target="_blank" rel="noopener noreferrer" className="text-green-700 hover:underline">WhatsApp</a> : null}
                  {e.email ? <a href={`mailto:${e.email}`} className="hover:text-navy">{e.email}</a> : null}
                  {e.location ? <span>{e.location}</span> : null}
                </div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  {e.service ? <Badge tone="navy">{e.service}</Badge> : null}
                  {e.propertyType ? <Badge>{e.propertyType}</Badge> : null}
                </div>
              </div>
              <div className="text-right text-xs text-slate-ink">{formatDate(e.createdAt)}</div>
            </div>
            <p className="mt-4 rounded-xl bg-mist p-4 text-sm whitespace-pre-line text-ink">{e.message}</p>
            <div className="mt-4 flex flex-wrap items-end gap-3">
              <form action={updateEnquiryAction} className="flex flex-1 flex-wrap items-end gap-3">
                <input type="hidden" name="id" value={e.id} />
                <label className="block"><span className="label">Status</span>
                  <Select name="status" defaultValue={e.status} className="w-40 capitalize">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </Select>
                </label>
                <label className="block min-w-[16rem] flex-1"><span className="label">Internal notes</span><Textarea name="notes" defaultValue={e.notes} rows={1} className="min-h-[2.75rem] font-sans" /></label>
                <SubmitButton variant="outline">Update</SubmitButton>
              </form>
              <form action={deleteEnquiryAction}>
                <input type="hidden" name="id" value={e.id} />
                <SubmitButton variant="danger" confirm="Delete this enquiry?">Delete</SubmitButton>
              </form>
            </div>
          </article>
        ))}
        {!rows.length ? <p className="rounded-2xl border border-dashed border-navy/15 p-10 text-center text-sm text-slate-ink">No enquiries in this view.</p> : null}
      </div>
    </>
  );
}
