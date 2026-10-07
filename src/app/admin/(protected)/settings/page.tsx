import { AdminPageHeader } from "@/components/admin/admin-ui";
import { Field, Input, Notice, Select, SubmitButton, Textarea } from "@/components/admin/form-bits";
import { MediaPicker } from "@/components/admin/media-picker";
import { changePasswordAction, saveSettingsAction } from "@/lib/admin-actions";
import { requireAdmin } from "@/lib/auth";
import { getMediaById, getSettings } from "@/lib/cms";
import { SETTINGS_GROUPS, type SettingsKey } from "@/lib/settings-defaults";

const LONG: SettingsKey[] = ["tagline", "closing_statement", "philosophy", "whatsapp_default_message", "default_seo_description", "address", "footer_note"];

export default async function SettingsAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; tab?: string; error?: string }> }) {
  const { saved, tab, error } = await searchParams;
  const [settings, user] = await Promise.all([getSettings(), requireAdmin()]);
  const [logo, logoLight] = await Promise.all([
    settings.logo_media_id ? getMediaById(Number(settings.logo_media_id)) : null,
    settings.logo_light_media_id ? getMediaById(Number(settings.logo_light_media_id)) : null,
  ]);
  const BOOLEAN_KEYS: SettingsKey[] = ["logo_show_wordmark", "show_whatsapp_button"];
  return (
    <>
      <AdminPageHeader title={tab === "contact" ? "Contact details" : "Site Settings"} description="Brand identity, legal name and RC number, contact details, WhatsApp, header CTA, SEO defaults and social links. Everything here feeds the public website." />
      <div className="mb-6"><Notice saved={saved} error={error} /></div>
      <form action={saveSettingsAction} className="space-y-6">
        <input type="hidden" name="_return" value={tab ? `/admin/settings?tab=${tab}` : "/admin/settings"} />
        {SETTINGS_GROUPS.map((group) => (
          <section key={group.title} id={group.title.toLowerCase().split(" ")[0]} className="card-admin">
            <h2 className="display text-lg text-navy">{group.title}</h2>
            {group.hint ? <p className="mt-1 text-xs text-slate-ink">{group.hint}</p> : null}
            <div className="mt-5 grid gap-5 md:grid-cols-2">
              {group.keys.map((key) =>
                key === "logo_media_id" ? (
                  <MediaPicker key={key} name={key} label="Official TRES logo (mark)" value={logo} typeFilter="image" hint="Upload the official TRES mark (SVG or PNG) in the Media Library and select it here. Until then the built-in placeholder mark is shown." />
                ) : key === "logo_light_media_id" ? (
                  <MediaPicker key={key} name={key} label="Logo for dark backgrounds (optional)" value={logoLight} typeFilter="image" hint="Light/white variant used in the footer and over the hero. Falls back to the main logo." />
                ) : BOOLEAN_KEYS.includes(key) ? (
                  <Field key={key} label={key.replace(/_/g, " ")}>
                    <Select name={key} defaultValue={settings[key] === "false" ? "false" : "true"}>
                      <option value="true">Yes</option>
                      <option value="false">No</option>
                    </Select>
                  </Field>
                ) : (
                  <Field key={key} label={key.replace(/_/g, " ")} className={LONG.includes(key) ? "md:col-span-2" : undefined}>
                    {LONG.includes(key) ? <Textarea name={key} defaultValue={settings[key]} rows={2} className="font-sans" /> : <Input name={key} defaultValue={settings[key]} />}
                  </Field>
                ),
              )}
            </div>
          </section>
        ))}
        <div className="flex justify-end"><SubmitButton>Save settings</SubmitButton></div>
      </form>

      <form action={changePasswordAction} className="card-admin mt-10 space-y-5">
        <div>
          <h2 className="display text-lg text-navy">Administrator account</h2>
          <p className="mt-1 text-xs text-slate-ink">Signed in as {user.email}. Change your password regularly. Additional administrators can be added later without architectural changes.</p>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Current password"><Input name="currentPassword" type="password" autoComplete="current-password" required /></Field>
          <Field label="New password" hint="At least 10 characters."><Input name="newPassword" type="password" autoComplete="new-password" required minLength={10} /></Field>
          <Field label="Confirm new password"><Input name="confirmPassword" type="password" autoComplete="new-password" required minLength={10} /></Field>
        </div>
        <div className="flex justify-end"><SubmitButton variant="navy">Update password</SubmitButton></div>
      </form>
    </>
  );
}
