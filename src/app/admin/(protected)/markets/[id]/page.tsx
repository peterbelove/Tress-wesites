import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Checkbox, Field, Input, Notice, SubmitButton, Textarea } from "@/components/admin/form-bits";
import { MediaPicker } from "@/components/admin/media-picker";
import { deleteMarketAction, saveMarketAction } from "@/lib/admin-actions";
import { getMarketById, getMediaMap } from "@/lib/cms";
import { itemsToText } from "@/lib/utils";

export default async function MarketEdit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  const { id } = await params;
  const { saved } = await searchParams;
  const isNew = id === "new";
  const market = isNew ? null : await getMarketById(parseInt(id, 10));
  if (!isNew && !market) notFound();
  const media = await getMediaMap([market?.mediaId]);
  return (
    <>
      <AdminPageHeader title={isNew ? "New market" : market!.title} backHref="/admin/markets" backLabel="Markets" actions={market ? <a href={`/markets/${market.slug}`} target="_blank" className="btn-outline py-2 text-sm">View page</a> : null} />
      <div className="mb-6"><Notice saved={saved} /></div>
      <form action={saveMarketAction} className="space-y-6">
        {market ? <input type="hidden" name="id" value={market.id} /> : null}
        <div className="card-admin grid gap-5 md:grid-cols-2">
          <Field label="Title"><Input name="title" defaultValue={market?.title} required /></Field>
          <Field label="Slug"><Input name="slug" defaultValue={market?.slug} placeholder="auto from title" /></Field>
          <Field label="Headline" className="md:col-span-2" hint="e.g. RELIABLE POWER FOR MODERN HOMES."><Input name="headline" defaultValue={market?.headline} /></Field>
          <Field label="Summary" className="md:col-span-2"><Textarea name="summary" defaultValue={market?.summary} rows={2} className="font-sans" /></Field>
          <Field label="Description" className="md:col-span-2"><Textarea name="description" defaultValue={market?.description} rows={6} /></Field>
          <Field label="Pain points" hint="One per line."><Textarea name="painPoints" defaultValue={(market?.painPoints ?? []).join("\n")} rows={8} /></Field>
          <Field label="How TRES responds" hint="One per line: Title | Description"><Textarea name="solutions" defaultValue={itemsToText(market?.solutions)} rows={8} /></Field>
          <Field label="CTA label"><Input name="ctaLabel" defaultValue={market?.ctaLabel ?? "Talk to TRES"} /></Field>
        </div>
        <div className="card-admin"><MediaPicker name="mediaId" label="Market image" value={market?.mediaId ? media.get(market.mediaId) ?? null : null} typeFilter="image" /></div>
        <div className="card-admin grid gap-5 md:grid-cols-3">
          <Field label="Order"><Input name="order" type="number" defaultValue={market?.order ?? 0} /></Field>
          <Checkbox name="visible" label="Visible" defaultChecked={market?.visible ?? true} />
          <Checkbox name="showOnHome" label="Show on homepage" defaultChecked={market?.showOnHome ?? true} />
          <Field label="SEO title"><Input name="seoTitle" defaultValue={market?.seoTitle} /></Field>
          <Field label="SEO description" className="md:col-span-2"><Input name="seoDescription" defaultValue={market?.seoDescription} /></Field>
        </div>
        <div className="flex justify-end"><SubmitButton>{isNew ? "Create market" : "Save changes"}</SubmitButton></div>
      </form>
      {market ? (
        <form action={deleteMarketAction} className="mt-8 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/50 p-4">
          <input type="hidden" name="id" value={market.id} />
          <span className="text-sm text-red-700">Delete this market permanently.</span>
          <SubmitButton variant="danger" confirm="Delete this market? This cannot be undone.">Delete</SubmitButton>
        </form>
      ) : null}
    </>
  );
}
