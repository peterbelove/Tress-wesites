"use server";

import { asc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  adminUsers,
  calculatorAppliances,
  calculatorSettings,
  enquiries,
  insights,
  markets,
  navigation,
  pageSections,
  projectMedia,
  projects,
  seoMetadata,
  services,
  siteSettings,
} from "@/db/schema";
import { assertAdmin, authenticate, createSession, destroySession, hashPassword } from "@/lib/auth";
import { DEFAULT_CALCULATOR_CONFIG, normalizeConfig } from "@/lib/calculator";
import { clientKey, rateLimit } from "@/lib/rate-limit";
import { DEFAULT_SETTINGS, type SettingsKey } from "@/lib/settings-defaults";
import { bool, parseItems, parseLines, slugify, str, toFloat, toInt, toOptionalId } from "@/lib/utils";

function refresh() {
  revalidatePath("/", "layout");
}

function done(path: string, params: Record<string, string> = { saved: "1" }): never {
  const qs = new URLSearchParams(params).toString();
  redirect(qs ? `${path}?${qs}` : path);
}

async function uniqueSlug(table: "projects" | "insights" | "services" | "markets", base: string, excludeId: number | null) {
  const slugBase = slugify(base) || `${table}-${Date.now()}`;
  let slug = slugBase;
  let n = 2;
  while (true) {
    let existing: { id: number }[] = [];
    if (table === "projects") existing = await db.select({ id: projects.id }).from(projects).where(eq(projects.slug, slug));
    if (table === "insights") existing = await db.select({ id: insights.id }).from(insights).where(eq(insights.slug, slug));
    if (table === "services") existing = await db.select({ id: services.id }).from(services).where(eq(services.slug, slug));
    if (table === "markets") existing = await db.select({ id: markets.id }).from(markets).where(eq(markets.slug, slug));
    const clash = existing.find((r) => r.id !== excludeId);
    if (!clash) return slug;
    slug = `${slugBase}-${n++}`;
  }
}

/* ------------------------------------------------------------------ */
/* Auth                                                                */
/* ------------------------------------------------------------------ */

export type LoginState = { error?: string };

export async function loginAction(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const h = await headers();
  const limit = rateLimit(clientKey(h, "login"), 10, 15 * 60 * 1000);
  if (!limit.ok) return { error: `Too many attempts. Try again in ${Math.ceil(limit.retryAfterSeconds / 60)} minutes.` };
  const email = str(formData.get("email")).toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!email || !password) return { error: "Enter your email and password." };
  const user = await authenticate(email, password);
  if (!user) return { error: "Incorrect email or password." };
  await createSession(user.id);
  const next = str(formData.get("next"));
  redirect(next && next.startsWith("/admin") && next !== "/admin/login" ? next : "/admin/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

export async function changePasswordAction(formData: FormData) {
  const user = await assertAdmin();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const confirm = String(formData.get("confirmPassword") ?? "");
  if (next.length < 10) done("/admin/settings", { error: "New password must be at least 10 characters." });
  if (next !== confirm) done("/admin/settings", { error: "New passwords do not match." });
  const verified = await authenticate(user.email, current);
  if (!verified) done("/admin/settings", { error: "Current password is incorrect." });
  await db.update(adminUsers).set({ passwordHash: hashPassword(next) }).where(eq(adminUsers.id, user.id));
  done("/admin/settings", { saved: "1" });
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export async function saveSettingsAction(formData: FormData) {
  await assertAdmin();
  const keys = Object.keys(DEFAULT_SETTINGS) as SettingsKey[];
  for (const key of keys) {
    if (!formData.has(key)) continue;
    const value = str(formData.get(key));
    await db
      .insert(siteSettings)
      .values({ key, value, updatedAt: new Date() })
      .onConflictDoUpdate({ target: siteSettings.key, set: { value, updatedAt: new Date() } });
  }
  refresh();
  done(str(formData.get("_return")) || "/admin/settings");
}

/* ------------------------------------------------------------------ */
/* Page sections                                                       */
/* ------------------------------------------------------------------ */

export async function saveSectionAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  if (!id) throw new Error("Missing section id");
  const patch: Partial<typeof pageSections.$inferInsert> = {
    title: str(formData.get("title")),
      subtitle: str(formData.get("subtitle")),
      body: str(formData.get("body")),
      items: parseItems(str(formData.get("items"))),
      primaryLabel: str(formData.get("primaryLabel")),
      primaryHref: str(formData.get("primaryHref")),
      secondaryLabel: str(formData.get("secondaryLabel")),
      secondaryHref: str(formData.get("secondaryHref")),
      mediaId: toOptionalId(formData.get("mediaId")),
      mobileMediaId: toOptionalId(formData.get("mobileMediaId")),
      videoMediaId: toOptionalId(formData.get("videoMediaId")),
      mobileVideoMediaId: toOptionalId(formData.get("mobileVideoMediaId")),
      posterMediaId: toOptionalId(formData.get("posterMediaId")),
      visible: bool(formData.get("visible")),
      order: toInt(formData.get("order")),
      updatedAt: new Date(),
  };
  // Eyebrow is no longer a managed field; only persist it if a form still supplies it.
  if (formData.has("eyebrow")) patch.eyebrow = str(formData.get("eyebrow"));
  await db.update(pageSections).set(patch).where(eq(pageSections.id, id));
  refresh();
  done(`/admin/sections/${id}`);
}

/* ------------------------------------------------------------------ */
/* Services & markets                                                  */
/* ------------------------------------------------------------------ */

export async function saveServiceAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  const title = str(formData.get("title"));
  if (!title) throw new Error("Title is required");
  const slug = await uniqueSlug("services", str(formData.get("slug")) || title, id || null);
  const values = {
    slug,
    number: str(formData.get("number")) || "01",
    title,
    shortTitle: str(formData.get("shortTitle")),
    headline: str(formData.get("headline")),
    summary: str(formData.get("summary")),
    description: str(formData.get("description")),
    capabilities: parseLines(str(formData.get("capabilities"))),
    outcomes: parseItems(str(formData.get("outcomes"))),
    mediaId: toOptionalId(formData.get("mediaId")),
    videoMediaId: toOptionalId(formData.get("videoMediaId")),
    order: toInt(formData.get("order")),
    visible: bool(formData.get("visible")),
    showOnHome: bool(formData.get("showOnHome")),
    seoTitle: str(formData.get("seoTitle")),
    seoDescription: str(formData.get("seoDescription")),
    updatedAt: new Date(),
  };
  let targetId = id;
  if (id) await db.update(services).set(values).where(eq(services.id, id));
  else {
    const [row] = await db.insert(services).values(values).returning({ id: services.id });
    targetId = row.id;
  }
  refresh();
  done(`/admin/services/${targetId}`);
}

export async function deleteServiceAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  if (id) await db.delete(services).where(eq(services.id, id));
  refresh();
  done("/admin/services", { deleted: "1" });
}

export async function saveMarketAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  const title = str(formData.get("title"));
  if (!title) throw new Error("Title is required");
  const slug = await uniqueSlug("markets", str(formData.get("slug")) || title, id || null);
  const values = {
    slug,
    title,
    headline: str(formData.get("headline")),
    summary: str(formData.get("summary")),
    description: str(formData.get("description")),
    painPoints: parseLines(str(formData.get("painPoints"))),
    solutions: parseItems(str(formData.get("solutions"))),
    ctaLabel: str(formData.get("ctaLabel")) || "Talk to TRES",
    mediaId: toOptionalId(formData.get("mediaId")),
    order: toInt(formData.get("order")),
    visible: bool(formData.get("visible")),
    showOnHome: bool(formData.get("showOnHome")),
    seoTitle: str(formData.get("seoTitle")),
    seoDescription: str(formData.get("seoDescription")),
    updatedAt: new Date(),
  };
  let targetId = id;
  if (id) await db.update(markets).set(values).where(eq(markets.id, id));
  else {
    const [row] = await db.insert(markets).values(values).returning({ id: markets.id });
    targetId = row.id;
  }
  refresh();
  done(`/admin/markets/${targetId}`);
}

export async function deleteMarketAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  if (id) await db.delete(markets).where(eq(markets.id, id));
  refresh();
  done("/admin/markets", { deleted: "1" });
}

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

type GalleryInput = { mediaId: number; kind: string; caption: string };

function parseGallery(raw: string): GalleryInput[] {
  try {
    const arr = JSON.parse(raw || "[]");
    if (!Array.isArray(arr)) return [];
    return arr
      .map((g) => ({
        mediaId: Number(g.mediaId),
        kind: String(g.kind || "gallery").slice(0, 32),
        caption: String(g.caption || "").slice(0, 300),
      }))
      .filter((g) => Number.isFinite(g.mediaId) && g.mediaId > 0);
  } catch {
    return [];
  }
}

export async function saveProjectAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  const title = str(formData.get("title"));
  if (!title) throw new Error("Title is required");
  const slug = await uniqueSlug("projects", str(formData.get("slug")) || title, id || null);
  const values = {
    slug,
    title,
    category: str(formData.get("category")),
    location: str(formData.get("location")),
    clientLabel: str(formData.get("clientLabel")),
    year: str(formData.get("year")).slice(0, 8),
    summary: str(formData.get("summary")),
    challenge: str(formData.get("challenge")),
    approach: str(formData.get("approach")),
    solution: str(formData.get("solution")),
    results: str(formData.get("results")),
    systemCapacity: str(formData.get("systemCapacity")),
    energyCapacity: str(formData.get("energyCapacity")),
    projectType: str(formData.get("projectType")),
    coverMediaId: toOptionalId(formData.get("coverMediaId")),
    featured: bool(formData.get("featured")),
    published: bool(formData.get("published")),
    order: toInt(formData.get("order")),
    seoTitle: str(formData.get("seoTitle")),
    seoDescription: str(formData.get("seoDescription")),
    updatedAt: new Date(),
  };
  let targetId = id;
  if (id) await db.update(projects).set(values).where(eq(projects.id, id));
  else {
    const [row] = await db.insert(projects).values(values).returning({ id: projects.id });
    targetId = row.id;
  }
  const gallery = parseGallery(str(formData.get("gallery")));
  await db.delete(projectMedia).where(eq(projectMedia.projectId, targetId));
  if (gallery.length) {
    await db.insert(projectMedia).values(
      gallery.map((g, i) => ({ projectId: targetId, mediaId: g.mediaId, kind: g.kind, caption: g.caption, order: i })),
    );
  }
  refresh();
  done(`/admin/projects/${targetId}`);
}

export async function deleteProjectAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  if (id) await db.delete(projects).where(eq(projects.id, id));
  refresh();
  done("/admin/projects", { deleted: "1" });
}

export async function duplicateProjectAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  const [src] = await db.select().from(projects).where(eq(projects.id, id)).limit(1);
  if (!src) throw new Error("Project not found");
  const { id: _id, createdAt: _c, updatedAt: _u, ...rest } = src;
  void _id;
  void _c;
  void _u;
  const slug = await uniqueSlug("projects", `${src.slug}-copy`, null);
  const [row] = await db
    .insert(projects)
    .values({ ...rest, slug, title: `${src.title} (copy)`, published: false, featured: false })
    .returning({ id: projects.id });
  const gallery = await db.select().from(projectMedia).where(eq(projectMedia.projectId, id)).orderBy(asc(projectMedia.order));
  if (gallery.length) {
    await db.insert(projectMedia).values(
      gallery.map((g) => ({ projectId: row.id, mediaId: g.mediaId, kind: g.kind, caption: g.caption, order: g.order })),
    );
  }
  refresh();
  done(`/admin/projects/${row.id}`, { duplicated: "1" });
}

export async function toggleProjectPublishedAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  const published = bool(formData.get("published"));
  await db.update(projects).set({ published, updatedAt: new Date() }).where(eq(projects.id, id));
  refresh();
  done(str(formData.get("_return")) || "/admin/projects");
}

/* ------------------------------------------------------------------ */
/* Insights                                                            */
/* ------------------------------------------------------------------ */

export async function saveInsightAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  const title = str(formData.get("title"));
  if (!title) throw new Error("Title is required");
  const slug = await uniqueSlug("insights", str(formData.get("slug")) || title, id || null);
  const dateRaw = str(formData.get("publishedAt"));
  const publishedAt = dateRaw && !Number.isNaN(Date.parse(dateRaw)) ? new Date(dateRaw) : new Date();
  const values = {
    slug,
    title,
    excerpt: str(formData.get("excerpt")),
    content: str(formData.get("content")),
    coverMediaId: toOptionalId(formData.get("coverMediaId")),
    category: str(formData.get("category")) || "Engineering",
    publishedAt,
    featured: bool(formData.get("featured")),
    published: bool(formData.get("published")),
    seoTitle: str(formData.get("seoTitle")),
    seoDescription: str(formData.get("seoDescription")),
    updatedAt: new Date(),
  };
  let targetId = id;
  if (id) await db.update(insights).set(values).where(eq(insights.id, id));
  else {
    const [row] = await db.insert(insights).values(values).returning({ id: insights.id });
    targetId = row.id;
  }
  refresh();
  done(`/admin/insights/${targetId}`);
}

export async function deleteInsightAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  if (id) await db.delete(insights).where(eq(insights.id, id));
  refresh();
  done("/admin/insights", { deleted: "1" });
}

/* ------------------------------------------------------------------ */
/* Calculator                                                          */
/* ------------------------------------------------------------------ */

function numberList(raw: string) {
  return raw
    .split(/[,\s]+/)
    .map((x) => parseFloat(x))
    .filter((x) => Number.isFinite(x) && x > 0);
}

export async function saveCalculatorSettingsAction(formData: FormData) {
  await assertAdmin();
  const d = DEFAULT_CALCULATOR_CONFIG;
  const gridConditions = parseLines(str(formData.get("gridConditions")))
    .map((line) => {
      const [key, label, fraction, ...desc] = line.split("|").map((x) => x.trim());
      return { key: slugify(key || ""), label: label || key || "", solarFraction: parseFloat(fraction || "1") || 1, description: desc.join("|").trim() };
    })
    .filter((g) => g.key && g.label);
  const locations = parseLines(str(formData.get("locations")))
    .map((line) => {
      const [name, sun] = line.split("|").map((x) => x.trim());
      return { name: name || "", sunHours: parseFloat(sun || "") || d.peakSunHoursDefault };
    })
    .filter((l) => l.name);
  const settings = normalizeConfig({
    peakSunHoursDefault: toFloat(formData.get("peakSunHoursDefault"), d.peakSunHoursDefault),
    systemEfficiency: toFloat(formData.get("systemEfficiency"), d.systemEfficiency),
    usableBatteryFraction: toFloat(formData.get("usableBatteryFraction"), d.usableBatteryFraction),
    designMargin: toFloat(formData.get("designMargin"), d.designMargin),
    diversityFactor: toFloat(formData.get("diversityFactor"), d.diversityFactor),
    backupLoadFactor: toFloat(formData.get("backupLoadFactor"), d.backupLoadFactor),
    peakToAverageRatio: toFloat(formData.get("peakToAverageRatio"), d.peakToAverageRatio),
    inverterPowerFactor: toFloat(formData.get("inverterPowerFactor"), d.inverterPowerFactor),
    inverterSurgeMargin: toFloat(formData.get("inverterSurgeMargin"), d.inverterSurgeMargin),
    inverterToSolarRatio: toFloat(formData.get("inverterToSolarRatio"), d.inverterToSolarRatio),
    panelWatt: toFloat(formData.get("panelWatt"), d.panelWatt),
    minPanels: toInt(formData.get("minPanels"), d.minPanels),
    tariffNairaPerKwh: toFloat(formData.get("tariffNairaPerKwh"), d.tariffNairaPerKwh),
    batteryOptionsKwh: numberList(str(formData.get("batteryOptionsKwh"))),
    inverterOptionsKva: numberList(str(formData.get("inverterOptionsKva"))),
    backupOptionsHours: numberList(str(formData.get("backupOptionsHours"))),
    gridConditions,
    propertyTypes: parseLines(str(formData.get("propertyTypes"))),
    locations,
    disclaimer: str(formData.get("disclaimer")),
    whatsappNumber: str(formData.get("whatsappNumber")),
    labels: {
      title: str(formData.get("label_title")) || d.labels.title,
      subtitle: str(formData.get("label_subtitle")) || d.labels.subtitle,
      resultTitle: str(formData.get("label_resultTitle")) || d.labels.resultTitle,
      readyTitle: str(formData.get("label_readyTitle")) || d.labels.readyTitle,
      quoteCta: str(formData.get("label_quoteCta")) || d.labels.quoteCta,
      whatsappCta: str(formData.get("label_whatsappCta")) || d.labels.whatsappCta,
    },
  });
  const [existing] = await db.select({ id: calculatorSettings.id }).from(calculatorSettings).limit(1);
  const payload = settings as unknown as Record<string, unknown>;
  if (existing) await db.update(calculatorSettings).set({ settings: payload, updatedAt: new Date() }).where(eq(calculatorSettings.id, existing.id));
  else await db.insert(calculatorSettings).values({ settings: payload });
  refresh();
  done("/admin/calculator");
}

export async function saveApplianceAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  const values = {
    name: str(formData.get("name")) || "Appliance",
    wattage: Math.max(1, toInt(formData.get("wattage"), 100)),
    defaultQuantity: Math.max(1, toInt(formData.get("defaultQuantity"), 1)),
    defaultHours: Math.min(24, Math.max(0, toFloat(formData.get("defaultHours"), 4))),
    order: toInt(formData.get("order")),
    visible: bool(formData.get("visible")),
  };
  if (id) await db.update(calculatorAppliances).set(values).where(eq(calculatorAppliances.id, id));
  else await db.insert(calculatorAppliances).values(values);
  refresh();
  done("/admin/calculator", { saved: "1", tab: "appliances" });
}

export async function deleteApplianceAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  if (id) await db.delete(calculatorAppliances).where(eq(calculatorAppliances.id, id));
  refresh();
  done("/admin/calculator", { deleted: "1", tab: "appliances" });
}

/* ------------------------------------------------------------------ */
/* Enquiries                                                           */
/* ------------------------------------------------------------------ */

const STATUSES = ["new", "contacted", "qualified", "closed"];

export async function updateEnquiryAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  const status = str(formData.get("status"));
  await db
    .update(enquiries)
    .set({ status: STATUSES.includes(status) ? status : "new", notes: str(formData.get("notes")), updatedAt: new Date() })
    .where(eq(enquiries.id, id));
  done("/admin/enquiries");
}

export async function deleteEnquiryAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  if (id) await db.delete(enquiries).where(eq(enquiries.id, id));
  done("/admin/enquiries", { deleted: "1" });
}

/* ------------------------------------------------------------------ */
/* Navigation                                                          */
/* ------------------------------------------------------------------ */

export async function saveNavigationAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  const values = {
    location: str(formData.get("location")) === "footer" ? "footer" : "header",
    label: str(formData.get("label")) || "Link",
    href: str(formData.get("href")) || "/",
    order: toInt(formData.get("order")),
    visible: bool(formData.get("visible")),
    openInNewTab: bool(formData.get("openInNewTab")),
  };
  if (id) await db.update(navigation).set(values).where(eq(navigation.id, id));
  else await db.insert(navigation).values(values);
  refresh();
  done("/admin/navigation");
}

export async function deleteNavigationAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  if (id) await db.delete(navigation).where(eq(navigation.id, id));
  refresh();
  done("/admin/navigation", { deleted: "1" });
}

/* ------------------------------------------------------------------ */
/* SEO                                                                 */
/* ------------------------------------------------------------------ */

export async function saveSeoAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  let path = str(formData.get("path"));
  if (!path.startsWith("/")) path = `/${path}`;
  const values = {
    path,
    title: str(formData.get("title")),
    description: str(formData.get("description")),
    canonical: str(formData.get("canonical")),
    ogMediaId: toOptionalId(formData.get("ogMediaId")),
    noIndex: bool(formData.get("noIndex")),
    updatedAt: new Date(),
  };
  if (id) await db.update(seoMetadata).set(values).where(eq(seoMetadata.id, id));
  else {
    await db
      .insert(seoMetadata)
      .values(values)
      .onConflictDoUpdate({ target: seoMetadata.path, set: values });
  }
  refresh();
  done("/admin/seo");
}

export async function deleteSeoAction(formData: FormData) {
  await assertAdmin();
  const id = toInt(formData.get("id"));
  if (id) await db.delete(seoMetadata).where(eq(seoMetadata.id, id));
  refresh();
  done("/admin/seo", { deleted: "1" });
}
