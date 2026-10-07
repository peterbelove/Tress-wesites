import { Checkbox, Field, Input, SubmitButton, Textarea } from "@/components/admin/form-bits";
import { MediaPicker } from "@/components/admin/media-picker";
import type { MediaRow, SectionRow } from "@/db/schema";
import { saveSectionAction } from "@/lib/admin-actions";
import { itemsToText } from "@/lib/utils";

export function SectionEditor({ section, media }: { section: SectionRow; media: Map<number, MediaRow> }) {
  const m = (id: number | null) => (id ? (media.get(id) ?? null) : null);
  const isHero = section.key === "hero";
  const isLegal = section.page === "privacy" || section.page === "terms";
  return (
    <form action={saveSectionAction} className="space-y-8">
      <input type="hidden" name="id" value={section.id} />
      {section.page === "about" && section.key === "founder" ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Add the founder&apos;s name and photo — named leadership builds trust. Use the Subtitle field for the name/role and the Image picker for a portrait. Do not invent a name.
        </div>
      ) : null}
      <div className="card-admin grid gap-5">
        <Field label="Display order"><Input name="order" type="number" defaultValue={section.order} /></Field>
        <Field label="Title" hint="Use a line break for multi-line headlines."><Textarea name="title" defaultValue={section.title} rows={2} className="font-sans text-base" /></Field>
        <Field label="Subtitle"><Textarea name="subtitle" defaultValue={section.subtitle} rows={2} className="font-sans" /></Field>
        <Field label={isLegal ? "Content" : "Body"} hint={isLegal ? "Supports ## headings, - lists and > quotes. Blank line between paragraphs." : "Blank line between paragraphs."}>
          <Textarea name="body" defaultValue={section.body} rows={isLegal ? 24 : 6} />
        </Field>
        {!isLegal ? (
          <Field label="Items" hint="One per line in the format: Title | Description. Used for lists such as pain points, process steps, beliefs or the POWER/PROTECT words.">
            <Textarea name="items" defaultValue={itemsToText(section.items)} rows={8} />
          </Field>
        ) : null}
      </div>

      <div className="card-admin grid gap-5 md:grid-cols-2">
        <Field label="Primary button label"><Input name="primaryLabel" defaultValue={section.primaryLabel} /></Field>
        <Field label="Primary button link"><Input name="primaryHref" defaultValue={section.primaryHref} placeholder="/contact" /></Field>
        <Field label="Secondary button label"><Input name="secondaryLabel" defaultValue={section.secondaryLabel} /></Field>
        <Field label="Secondary button link"><Input name="secondaryHref" defaultValue={section.secondaryHref} placeholder="/solar-calculator" /></Field>
      </div>

      <div className="card-admin grid gap-5 md:grid-cols-2">
        <MediaPicker name="mediaId" label={isHero ? "Desktop image" : "Image"} value={m(section.mediaId)} typeFilter="image" />
        {isHero ? (
          <>
            <MediaPicker name="mobileMediaId" label="Mobile image" value={m(section.mobileMediaId)} typeFilter="image" hint="Optional. Used on small screens." />
            <MediaPicker name="videoMediaId" label="Background video" value={m(section.videoMediaId)} typeFilter="video" hint="Optional. Autoplays muted, falls back to the poster image." />
            <MediaPicker name="mobileVideoMediaId" label="Mobile video" value={m(section.mobileVideoMediaId)} typeFilter="video" hint="Optional lighter file for mobile." />
            <MediaPicker name="posterMediaId" label="Video poster" value={m(section.posterMediaId)} typeFilter="image" />
          </>
        ) : (
          <MediaPicker name="videoMediaId" label="Video (optional)" value={m(section.videoMediaId)} typeFilter="video" />
        )}
      </div>

      <div className="card-admin flex flex-wrap items-center justify-between gap-4">
        <Checkbox name="visible" label="Visible on the website" defaultChecked={section.visible} />
        <SubmitButton />
      </div>
    </form>
  );
}
