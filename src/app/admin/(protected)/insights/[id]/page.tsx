import { notFound } from "next/navigation";
import { AdminPageHeader, Badge } from "@/components/admin/admin-ui";
import { Checkbox, Field, Input, Notice, SubmitButton, Textarea } from "@/components/admin/form-bits";
import { MediaPicker } from "@/components/admin/media-picker";
import { deleteInsightAction, saveInsightAction } from "@/lib/admin-actions";
import { getInsightById } from "@/lib/cms";

export default async function InsightEdit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const isNew = id === "new";
  const insight = isNew ? null : await getInsightById(parseInt(id, 10));
  if (!isNew && !insight) notFound();
  const dateValue = insight ? new Date(insight.publishedAt).toISOString().slice(0, 10) : new Date().toISOString().slice(0, 10);
  return (
    <>
      <AdminPageHeader
        title={isNew ? "New insight" : insight!.title}
        backHref="/admin/insights"
        backLabel="Insights"
        actions={insight ? (<><Badge tone={insight.published ? "green" : "amber"}>{insight.published ? "Published" : "Draft"}</Badge><a href={`/insights/${insight.slug}?preview=1`} target="_blank" className="btn-outline py-2 text-sm">Preview</a></>) : null}
      />
      <div className="mb-6"><Notice saved={saved} /></div>
      <form action={saveInsightAction} className="space-y-6">
        {insight ? <input type="hidden" name="id" value={insight.id} /> : null}
        <div className="card-admin grid gap-5 md:grid-cols-2">
          <Field label="Title" className="md:col-span-2"><Input name="title" defaultValue={insight?.title} required /></Field>
          <Field label="Slug"><Input name="slug" defaultValue={insight?.slug} placeholder="auto from title" /></Field>
          <Field label="Category" hint="Solar, Battery Storage, Electrical, Security, Automation, Engineering Advice…"><Input name="category" defaultValue={insight?.category ?? "Engineering"} /></Field>
          <Field label="Excerpt" className="md:col-span-2"><Textarea name="excerpt" defaultValue={insight?.excerpt} rows={2} className="font-sans" /></Field>
          <Field label="Content" className="md:col-span-2" hint="Supports ## headings, ### subheadings, - bullet lists and > quotes. Blank line between paragraphs.">
            <Textarea name="content" defaultValue={insight?.content} rows={22} />
          </Field>
        </div>
        <div className="card-admin grid gap-5 md:grid-cols-2">
          <MediaPicker name="coverMediaId" label="Cover image" value={insight?.cover ?? null} typeFilter="image" />
          <Field label="Publish date"><Input name="publishedAt" type="date" defaultValue={dateValue} /></Field>
          <Checkbox name="published" label="Published" defaultChecked={insight?.published ?? false} />
          <Checkbox name="featured" label="Featured" hint="Featured insights are prioritised on the homepage." defaultChecked={insight?.featured ?? false} />
          <Field label="SEO title"><Input name="seoTitle" defaultValue={insight?.seoTitle} /></Field>
          <Field label="SEO description"><Input name="seoDescription" defaultValue={insight?.seoDescription} /></Field>
        </div>
        <div className="flex justify-end"><SubmitButton>{isNew ? "Create insight" : "Save changes"}</SubmitButton></div>
      </form>
      {insight ? (
        <form action={deleteInsightAction} className="mt-8 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/50 p-4">
          <input type="hidden" name="id" value={insight.id} />
          <span className="text-sm text-red-700">Delete this insight permanently.</span>
          <SubmitButton variant="danger" confirm="Delete this insight? This cannot be undone.">Delete</SubmitButton>
        </form>
      ) : null}
    </>
  );
}
