import Link from "next/link";
import { count, desc } from "drizzle-orm";
import { db } from "@/db";
import { calculatorSubmissions } from "@/db/schema";
import { AdminPageHeader, Badge, Table } from "@/components/admin/admin-ui";
import { Checkbox, Field, Input, Notice, SubmitButton, Textarea } from "@/components/admin/form-bits";
import { deleteApplianceAction, saveApplianceAction, saveCalculatorSettingsAction } from "@/lib/admin-actions";
import { getCalculatorAdminData } from "@/lib/cms";
import { cn, formatDateShort } from "@/lib/utils";

export default async function CalculatorAdmin({ searchParams }: { searchParams: Promise<{ tab?: string; saved?: string; deleted?: string }> }) {
  const { tab = "settings", saved, deleted } = await searchParams;
  const { config, appliances } = await getCalculatorAdminData();
  const [[{ c: submissionCount }], recent] = await Promise.all([
    db.select({ c: count() }).from(calculatorSubmissions),
    db.select().from(calculatorSubmissions).orderBy(desc(calculatorSubmissions.createdAt)).limit(8),
  ]);
  const tabs = [
    { key: "settings", label: "Sizing assumptions" },
    { key: "appliances", label: `Appliances (${appliances.length})` },
    { key: "submissions", label: `Estimates (${submissionCount})` },
  ];
  const num = (name: string, label: string, value: number, hint?: string, step = "0.01") => (
    <Field label={label} hint={hint}><Input name={name} type="number" step={step} defaultValue={value} /></Field>
  );

  return (
    <>
      <AdminPageHeader title="Solar Calculator" description="Every assumption behind the public calculator lives here. Changes apply immediately — no code changes." actions={<Link href="/solar-calculator" target="_blank" className="btn-outline py-2 text-sm">Open calculator</Link>} />
      <div className="mb-6 flex gap-1 rounded-full border border-navy/10 bg-white p-1 text-sm">
        {tabs.map((t) => (
          <Link key={t.key} href={`/admin/calculator?tab=${t.key}`} className={cn("rounded-full px-4 py-1.5", tab === t.key ? "bg-navy text-white" : "text-navy hover:bg-navy/5")}>{t.label}</Link>
        ))}
      </div>
      <div className="mb-6"><Notice saved={saved} deleted={deleted} /></div>

      {tab === "settings" ? (
        <form action={saveCalculatorSettingsAction} className="space-y-6">
          <div className="card-admin grid gap-5 md:grid-cols-3">
            <h2 className="display text-lg text-navy md:col-span-3">Solar assumptions</h2>
            {num("peakSunHoursDefault", "Default peak sun hours", config.peakSunHoursDefault, "Used when a location is not selected.")}
            {num("systemEfficiency", "System efficiency (0–1)", config.systemEfficiency, "Panel, wiring and conversion losses combined.")}
            {num("designMargin", "Design margin (×)", config.designMargin, "Oversizing factor applied to solar.")}
            {num("panelWatt", "Panel rating (W)", config.panelWatt, undefined, "1")}
            {num("minPanels", "Minimum panels", config.minPanels, undefined, "1")}
            {num("tariffNairaPerKwh", "Indicative tariff (₦/kWh)", config.tariffNairaPerKwh, "Converts a monthly bill into daily kWh.")}
          </div>
          <div className="card-admin grid gap-5 md:grid-cols-3">
            <h2 className="display text-lg text-navy md:col-span-3">Load, battery & inverter rules</h2>
            {num("diversityFactor", "Diversity factor (0–1)", config.diversityFactor, "Share of connected load running simultaneously.")}
            {num("backupLoadFactor", "Backup load factor (0–1)", config.backupLoadFactor, "Share of peak load carried during backup.")}
            {num("usableBatteryFraction", "Usable battery fraction (0–1)", config.usableBatteryFraction, "Depth of discharge.")}
            {num("peakToAverageRatio", "Peak-to-average ratio", config.peakToAverageRatio, "Used when only daily kWh / bill is known.")}
            {num("inverterPowerFactor", "Inverter power factor", config.inverterPowerFactor)}
            {num("inverterSurgeMargin", "Inverter surge margin (×)", config.inverterSurgeMargin)}
            {num("inverterToSolarRatio", "Min inverter : solar ratio", config.inverterToSolarRatio)}
            <Field label="Battery options (kWh)" hint="Comma separated, ascending."><Input name="batteryOptionsKwh" defaultValue={config.batteryOptionsKwh.join(", ")} /></Field>
            <Field label="Inverter options (kVA)" hint="Comma separated, ascending."><Input name="inverterOptionsKva" defaultValue={config.inverterOptionsKva.join(", ")} /></Field>
            <Field label="Backup options (hours)"><Input name="backupOptionsHours" defaultValue={config.backupOptionsHours.join(", ")} /></Field>
          </div>
          <div className="card-admin grid gap-5 md:grid-cols-2">
            <h2 className="display text-lg text-navy md:col-span-2">Options & locations</h2>
            <Field label="Grid conditions" hint="One per line: key | Label | solar fraction | description"><Textarea name="gridConditions" rows={6} defaultValue={config.gridConditions.map((g) => `${g.key} | ${g.label} | ${g.solarFraction} | ${g.description}`).join("\n")} /></Field>
            <Field label="Property types" hint="One per line."><Textarea name="propertyTypes" rows={6} defaultValue={config.propertyTypes.join("\n")} /></Field>
            <Field label="Locations & peak sun hours" className="md:col-span-2" hint="One per line: State | sun hours"><Textarea name="locations" rows={12} defaultValue={config.locations.map((l) => `${l.name} | ${l.sunHours}`).join("\n")} /></Field>
          </div>
          <div className="card-admin grid gap-5 md:grid-cols-2">
            <h2 className="display text-lg text-navy md:col-span-2">Labels, WhatsApp & disclaimer</h2>
            <Field label="Title"><Input name="label_title" defaultValue={config.labels.title} /></Field>
            <Field label="Subtitle"><Input name="label_subtitle" defaultValue={config.labels.subtitle} /></Field>
            <Field label="Result title"><Input name="label_resultTitle" defaultValue={config.labels.resultTitle} /></Field>
            <Field label="Ready title"><Input name="label_readyTitle" defaultValue={config.labels.readyTitle} /></Field>
            <Field label="Quotation CTA"><Input name="label_quoteCta" defaultValue={config.labels.quoteCta} /></Field>
            <Field label="WhatsApp CTA"><Input name="label_whatsappCta" defaultValue={config.labels.whatsappCta} /></Field>
            <Field label="WhatsApp number override" hint="Leave blank to use the site-wide WhatsApp number from Settings."><Input name="whatsappNumber" defaultValue={config.whatsappNumber} /></Field>
            <Field label="Disclaimer" className="md:col-span-2"><Textarea name="disclaimer" rows={3} defaultValue={config.disclaimer} className="font-sans" /></Field>
          </div>
          <div className="flex justify-end"><SubmitButton>Save calculator settings</SubmitButton></div>
        </form>
      ) : null}

      {tab === "appliances" ? (
        <div className="space-y-6">
          <Table head={["Appliance", "Wattage (W)", "Default qty", "Default hrs/day", "Order", "Visible", ""]}>
            {appliances.map((a) => (
              <tr key={a.id}>
                <td colSpan={7} className="p-0">
                  <div className="flex flex-wrap items-end gap-2 px-4 py-3">
                    <form action={saveApplianceAction} className="flex flex-1 flex-wrap items-end gap-2">
                      <input type="hidden" name="id" value={a.id} />
                      <Input name="name" defaultValue={a.name} className="w-48" aria-label="Appliance name" />
                      <Input name="wattage" type="number" defaultValue={a.wattage} className="w-24" aria-label="Wattage" />
                      <Input name="defaultQuantity" type="number" defaultValue={a.defaultQuantity} className="w-20" aria-label="Default quantity" />
                      <Input name="defaultHours" type="number" step="0.5" defaultValue={a.defaultHours} className="w-20" aria-label="Default hours" />
                      <Input name="order" type="number" defaultValue={a.order} className="w-20" aria-label="Order" />
                      <label className="flex items-center gap-2 text-xs text-navy"><input type="checkbox" name="visible" defaultChecked={a.visible} className="accent-green" /> Visible</label>
                      <SubmitButton variant="outline" className="py-2 text-xs">Save</SubmitButton>
                    </form>
                    <form action={deleteApplianceAction}>
                      <input type="hidden" name="id" value={a.id} />
                      <SubmitButton variant="danger" className="py-2 text-xs" confirm={`Delete “${a.name}”?`}>Delete</SubmitButton>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </Table>
          <form action={saveApplianceAction} className="card-admin flex flex-wrap items-end gap-3">
            <h2 className="display w-full text-lg text-navy">Add appliance</h2>
            <Field label="Name"><Input name="name" required className="w-48" /></Field>
            <Field label="Wattage (W)"><Input name="wattage" type="number" defaultValue={100} className="w-28" /></Field>
            <Field label="Default qty"><Input name="defaultQuantity" type="number" defaultValue={1} className="w-24" /></Field>
            <Field label="Default hrs/day"><Input name="defaultHours" type="number" step="0.5" defaultValue={4} className="w-24" /></Field>
            <Field label="Order"><Input name="order" type="number" defaultValue={appliances.length} className="w-24" /></Field>
            <Checkbox name="visible" label="Visible" defaultChecked />
            <SubmitButton>Add</SubmitButton>
          </form>
        </div>
      ) : null}

      {tab === "submissions" ? (
        <Table head={["When", "Property", "Location", "Daily kWh", "Solar", "Battery", "Inverter"]}>
          {recent.map((s) => {
            const i = s.inputs as Record<string, unknown>;
            const r = s.results as Record<string, unknown>;
            return (
              <tr key={s.id}>
                <td className="px-4 py-3 text-slate-ink">{formatDateShort(s.createdAt)}</td>
                <td className="px-4 py-3 text-navy">{String(i.propertyType ?? "—")}</td>
                <td className="px-4 py-3 text-slate-ink">{String(i.location || "—")}</td>
                <td className="px-4 py-3 font-mono text-xs">{String(r.dailyEnergyKwh ?? "—")}</td>
                <td className="px-4 py-3 font-mono text-xs">{String(r.solarKw ?? "—")} kW</td>
                <td className="px-4 py-3 font-mono text-xs">{String(r.batteryKwh ?? "—")} kWh</td>
                <td className="px-4 py-3 font-mono text-xs">{String(r.inverterKva ?? "—")} kVA</td>
              </tr>
            );
          })}
          {!recent.length ? <tr><td colSpan={7} className="px-4 py-8 text-center text-slate-ink">No estimates generated yet. <Badge>Anonymous</Badge></td></tr> : null}
        </Table>
      ) : null}
    </>
  );
}
