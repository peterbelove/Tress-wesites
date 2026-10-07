import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Checkbox, Field, Input, Notice, SubmitButton, Textarea } from "@/components/admin/form-bits";
import { MediaPicker } from "@/components/admin/media-picker";
import { deleteServiceAction, saveServiceAction } from "@/lib/admin-actions";
import { getMediaMap, getServiceById } from "@/lib/cms";
import { itemsToText } from "@/lib/utils";

export default async function ServiceEdit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const isNew = id === "new";
  const service = isNew ? null : await getServiceById(parseInt(id, 10));
  if (!isNew && !service) notFound();
  const media = await getMediaMap([service?.mediaId, service?.videoMediaId]);
  return (
    <>
      <AdminPageHeader
        title={isNew ? "New service" : service!.title}
        backHref="/admin/services"
        backLabel="Services"
        actions={service ? <a href={`/services/${service.slug}`} target="_blank" className="btn-outline py-2 text-sm">View page</a> : null}
      />
      <div className="mb-6"><Notice saved={saved} /></div>
      <form action={saveServiceAction} className="space-y-6">
        {service ? <input type="hidden" name="id" value={service.id} /> : null}
        <div className="card-admin grid gap-5 md:grid-cols-2">
          <Field label="Title"><Input name="title" defaultValue={service?.title} required /></Field>
          <Field label="Short title" hint="Used in compact navigation."><Input name="shortTitle" defaultValue={service?.shortTitle} /></Field>
          <Field label="Number" hint="e.g. 01"><Input name="number" defaultValue={service?.number ?? "01"} /></Field>
          <Field label="Slug" hint="URL: /services/slug"><Input name="slug" defaultValue={service?.slug} placeholder="auto from title" /></Field>
          <Field label="Customer headline" className="md:col-span-2" hint="Outcome-led headline, e.g. “See what matters. Protect what matters.”"><Input name="headline" defaultValue={service?.headline} /></Field>
          <Field label="Summary" className="md:col-span-2"><Textarea name="summary" defaultValue={service?.summary} rows={2} className="font-sans" /></Field>
          <Field label="Description" className="md:col-span-2" hint="Blank line between paragraphs."><Textarea name="description" defaultValue={service?.description} rows={8} /></Field>
          <Field label="Capabilities" hint="One per line."><Textarea name="capabilities" defaultValue={(service?.capabilities ?? []).join("\n")} rows={10} /></Field>
          <Field label="Customer outcomes" hint="One per line: Title | Description"><Textarea name="outcomes" defaultValue={itemsToText(service?.outcomes)} rows={10} /></Field>
        </div>
        <div className="card-admin grid gap-5 md:grid-cols-2">
          <MediaPicker name="mediaId" label="Service image" value={service?.mediaId ? media.get(service.mediaId) ?? null : null} typeFilter="image" />
          <MediaPicker name="videoMediaId" label="Service video (optional)" value={service?.videoMediaId ? media.get(service.videoMediaId) ?? null : null} typeFilter="video" />
        </div>
        <div className="card-admin grid gap-5 md:grid-cols-3">
          <Field label="Order"><Input name="order" type="number" defaultValue={service?.order ?? 0} /></Field>
          <Checkbox name="visible" label="Visible" defaultChecked={service?.visible ?? true} />
          <Checkbox name="showOnHome" label="Show on homepage" defaultChecked={service?.showOnHome ?? true} />
          <Field label="SEO title"><Input name="seoTitle" defaultValue={service?.seoTitle} /></Field>
          <Field label="SEO description" className="md:col-span-2"><Input name="seoDescription" defaultValue={service?.seoDescription} /></Field>
        </div>
        <div className="flex justify-end"><SubmitButton>{isNew ? "Create service" : "Save changes"}</SubmitButton></div>
      </form>
      {service ? (
        <form action={deleteServiceAction} className="mt-8 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/50 p-4">
          <input type="hidden" name="id" value={service.id} />
          <span className="text-sm text-red-700">Delete this service permanently.</span>
          <SubmitButton variant="danger" confirm="Delete this service? This cannot be undone.">Delete</SubmitButton>
        </form>
      ) : null}
    </>
  );
}
