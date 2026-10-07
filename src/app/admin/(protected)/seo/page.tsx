import { asc } from "drizzle-orm";
import { db } from "@/db";
import { seoMetadata } from "@/db/schema";
import { AdminPageHeader, Badge, Table } from "@/components/admin/admin-ui";
import { Checkbox, Field, Input, Notice, SubmitButton, Textarea } from "@/components/admin/form-bits";
import { MediaPicker } from "@/components/admin/media-picker";
import { deleteSeoAction, saveSeoAction } from "@/lib/admin-actions";
import { getMediaMap } from "@/lib/cms";

export default async function SeoAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string; edit?: string }> }) {
  const { saved, deleted, edit } = await searchParams;
  const rows = await db.select().from(seoMetadata).orderBy(asc(seoMetadata.path));
  const media = await getMediaMap(rows.map((r) => r.ogMediaId));
  const editing = edit ? rows.find((r) => String(r.id) === edit) ?? null : null;
  return (
    <>
      <AdminPageHeader title="SEO" description="Override the title, description, canonical URL and Open Graph image for any path. Pages without an override use their content and the site defaults in Settings. Sitemap: /sitemap.xml · Robots: /robots.txt" />
      <div className="mb-6"><Notice saved={saved} deleted={deleted} /></div>
      <div className="grid gap-8 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <Table head={["Path", "Title", "Index", ""]}>
            {rows.map((r) => (
              <tr key={r.id}>
                <td className="px-4 py-3 font-mono text-xs text-navy">{r.path}</td>
                <td className="px-4 py-3 text-slate-ink">{r.title || "—"}</td>
                <td className="px-4 py-3">{r.noIndex ? <Badge tone="amber">noindex</Badge> : <Badge tone="green">index</Badge>}</td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <a href={`/admin/seo?edit=${r.id}`} className="btn-outline mr-2 py-1.5 text-xs">Edit</a>
                  <form action={deleteSeoAction} className="inline"><input type="hidden" name="id" value={r.id} /><SubmitButton variant="danger" className="py-1.5 text-xs" confirm="Remove this override?">Remove</SubmitButton></form>
                </td>
              </tr>
            ))}
            {!rows.length ? <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-ink">No overrides yet. Add one on the right.</td></tr> : null}
          </Table>
        </div>
        <form action={saveSeoAction} className="card-admin space-y-4 lg:col-span-2">
          <h2 className="display text-lg text-navy">{editing ? `Edit ${editing.path}` : "Add override"}</h2>
          {editing ? <input type="hidden" name="id" value={editing.id} /> : null}
          <Field label="Path" hint="e.g. / or /services/renewable-energy"><Input name="path" defaultValue={editing?.path} required /></Field>
          <Field label="SEO title"><Input name="title" defaultValue={editing?.title} /></Field>
          <Field label="Meta description"><Textarea name="description" defaultValue={editing?.description} rows={3} className="font-sans" /></Field>
          <Field label="Canonical URL"><Input name="canonical" defaultValue={editing?.canonical} placeholder="https://…" /></Field>
          <MediaPicker name="ogMediaId" label="Open Graph image" value={editing?.ogMediaId ? media.get(editing.ogMediaId) ?? null : null} typeFilter="image" />
          <Checkbox name="noIndex" label="Hide from search engines (noindex)" defaultChecked={editing?.noIndex ?? false} />
          <div className="flex justify-end gap-2">
            {editing ? <a href="/admin/seo" className="btn-outline py-2 text-sm">Cancel</a> : null}
            <SubmitButton>{editing ? "Save override" : "Add override"}</SubmitButton>
          </div>
        </form>
      </div>
    </>
  );
}
