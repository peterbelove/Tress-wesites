import {
  boolean,
  integer,
  jsonb,
  pgTable,
  real,
  serial,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Administration                                                      */
/* ------------------------------------------------------------------ */

export const adminUsers = pgTable("admin_users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  name: text("name").notNull(),
  passwordHash: text("password_hash").notNull(),
  role: varchar("role", { length: 32 }).notNull().default("admin"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => adminUsers.id, { onDelete: "cascade" }),
  tokenHash: text("token_hash").notNull().unique(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Media library                                                       */
/* ------------------------------------------------------------------ */

export const media = pgTable("media", {
  id: serial("id").primaryKey(),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  thumbnailUrl: text("thumbnail_url"),
  title: text("title").notNull().default(""),
  description: text("description").notNull().default(""),
  altText: text("alt_text").notNull().default(""),
  type: varchar("type", { length: 16 }).notNull().default("image"), // image | video
  mimeType: varchar("mime_type", { length: 100 }).notNull().default(""),
  width: integer("width"),
  height: integer("height"),
  size: integer("size"),
  category: varchar("category", { length: 64 }).notNull().default("general"),
  source: varchar("source", { length: 16 }).notNull().default("upload"), // upload | external
  credit: text("credit").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Settings, navigation, SEO                                           */
/* ------------------------------------------------------------------ */

export const siteSettings = pgTable("site_settings", {
  key: varchar("key", { length: 100 }).primaryKey(),
  value: text("value").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const navigation = pgTable("navigation", {
  id: serial("id").primaryKey(),
  location: varchar("location", { length: 32 }).notNull().default("header"), // header | footer
  label: text("label").notNull(),
  href: text("href").notNull(),
  order: integer("order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  openInNewTab: boolean("open_in_new_tab").notNull().default(false),
});

export const seoMetadata = pgTable("seo_metadata", {
  id: serial("id").primaryKey(),
  path: text("path").notNull().unique(),
  title: text("title").notNull().default(""),
  description: text("description").notNull().default(""),
  canonical: text("canonical").notNull().default(""),
  ogMediaId: integer("og_media_id").references(() => media.id, { onDelete: "set null" }),
  noIndex: boolean("no_index").notNull().default(false),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Page sections (homepage, about, legal)                              */
/* ------------------------------------------------------------------ */

export type SectionItem = { title: string; text: string };

export const pageSections = pgTable(
  "page_sections",
  {
    id: serial("id").primaryKey(),
    page: varchar("page", { length: 64 }).notNull(), // home | about | privacy | terms | contact
    key: varchar("key", { length: 64 }).notNull(),
    label: text("label").notNull().default(""),
    eyebrow: text("eyebrow").notNull().default(""),
    title: text("title").notNull().default(""),
    subtitle: text("subtitle").notNull().default(""),
    body: text("body").notNull().default(""),
    items: jsonb("items").$type<SectionItem[]>().notNull().default([]),
    primaryLabel: text("primary_label").notNull().default(""),
    primaryHref: text("primary_href").notNull().default(""),
    secondaryLabel: text("secondary_label").notNull().default(""),
    secondaryHref: text("secondary_href").notNull().default(""),
    mediaId: integer("media_id").references(() => media.id, { onDelete: "set null" }),
    mobileMediaId: integer("mobile_media_id").references(() => media.id, { onDelete: "set null" }),
    videoMediaId: integer("video_media_id").references(() => media.id, { onDelete: "set null" }),
    mobileVideoMediaId: integer("mobile_video_media_id").references(() => media.id, {
      onDelete: "set null",
    }),
    posterMediaId: integer("poster_media_id").references(() => media.id, { onDelete: "set null" }),
    visible: boolean("visible").notNull().default(true),
    order: integer("order").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("page_sections_page_key_idx").on(t.page, t.key)],
);

/* ------------------------------------------------------------------ */
/* Services & markets                                                  */
/* ------------------------------------------------------------------ */

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  number: varchar("number", { length: 4 }).notNull().default("01"),
  title: text("title").notNull(),
  shortTitle: text("short_title").notNull().default(""),
  headline: text("headline").notNull().default(""),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  capabilities: jsonb("capabilities").$type<string[]>().notNull().default([]),
  outcomes: jsonb("outcomes").$type<SectionItem[]>().notNull().default([]),
  mediaId: integer("media_id").references(() => media.id, { onDelete: "set null" }),
  videoMediaId: integer("video_media_id").references(() => media.id, { onDelete: "set null" }),
  order: integer("order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  showOnHome: boolean("show_on_home").notNull().default(true),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const markets = pgTable("markets", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 120 }).notNull().unique(),
  title: text("title").notNull(),
  headline: text("headline").notNull().default(""),
  summary: text("summary").notNull().default(""),
  description: text("description").notNull().default(""),
  painPoints: jsonb("pain_points").$type<string[]>().notNull().default([]),
  solutions: jsonb("solutions").$type<SectionItem[]>().notNull().default([]),
  ctaLabel: text("cta_label").notNull().default("Talk to TRES"),
  mediaId: integer("media_id").references(() => media.id, { onDelete: "set null" }),
  order: integer("order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
  showOnHome: boolean("show_on_home").notNull().default(true),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Projects                                                            */
/* ------------------------------------------------------------------ */

export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: text("title").notNull(),
  category: text("category").notNull().default(""),
  location: text("location").notNull().default(""),
  clientLabel: text("client_label").notNull().default(""),
  year: varchar("year", { length: 8 }).notNull().default(""),
  summary: text("summary").notNull().default(""),
  challenge: text("challenge").notNull().default(""),
  approach: text("approach").notNull().default(""),
  solution: text("solution").notNull().default(""),
  results: text("results").notNull().default(""),
  systemCapacity: text("system_capacity").notNull().default(""),
  energyCapacity: text("energy_capacity").notNull().default(""),
  projectType: text("project_type").notNull().default(""),
  coverMediaId: integer("cover_media_id").references(() => media.id, { onDelete: "set null" }),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(false),
  order: integer("order").notNull().default(0),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const projectMedia = pgTable("project_media", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id")
    .notNull()
    .references(() => projects.id, { onDelete: "cascade" }),
  mediaId: integer("media_id")
    .notNull()
    .references(() => media.id, { onDelete: "cascade" }),
  kind: varchar("kind", { length: 32 }).notNull().default("gallery"), // gallery | video | before | after | diagram | document
  caption: text("caption").notNull().default(""),
  order: integer("order").notNull().default(0),
});

/* ------------------------------------------------------------------ */
/* Insights                                                            */
/* ------------------------------------------------------------------ */

export const insights = pgTable("insights", {
  id: serial("id").primaryKey(),
  slug: varchar("slug", { length: 160 }).notNull().unique(),
  title: text("title").notNull(),
  excerpt: text("excerpt").notNull().default(""),
  content: text("content").notNull().default(""),
  coverMediaId: integer("cover_media_id").references(() => media.id, { onDelete: "set null" }),
  category: text("category").notNull().default("Engineering"),
  publishedAt: timestamp("published_at", { withTimezone: true }).defaultNow().notNull(),
  featured: boolean("featured").notNull().default(false),
  published: boolean("published").notNull().default(false),
  seoTitle: text("seo_title").notNull().default(""),
  seoDescription: text("seo_description").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Solar calculator                                                    */
/* ------------------------------------------------------------------ */

export const calculatorSettings = pgTable("calculator_settings", {
  id: serial("id").primaryKey(),
  settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const calculatorAppliances = pgTable("calculator_appliances", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  wattage: integer("wattage").notNull().default(100),
  defaultQuantity: integer("default_quantity").notNull().default(1),
  defaultHours: real("default_hours").notNull().default(4),
  order: integer("order").notNull().default(0),
  visible: boolean("visible").notNull().default(true),
});

export const calculatorSubmissions = pgTable("calculator_submissions", {
  id: serial("id").primaryKey(),
  inputs: jsonb("inputs").$type<Record<string, unknown>>().notNull().default({}),
  results: jsonb("results").$type<Record<string, unknown>>().notNull().default({}),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Enquiries                                                           */
/* ------------------------------------------------------------------ */

export const enquiries = pgTable("enquiries", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().default(""),
  phone: text("phone").notNull().default(""),
  whatsapp: text("whatsapp").notNull().default(""),
  location: text("location").notNull().default(""),
  service: text("service").notNull().default(""),
  propertyType: text("property_type").notNull().default(""),
  message: text("message").notNull().default(""),
  source: text("source").notNull().default("contact"),
  status: varchar("status", { length: 24 }).notNull().default("new"), // new | contacted | qualified | closed
  notes: text("notes").notNull().default(""),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

/* ------------------------------------------------------------------ */
/* Inferred types                                                      */
/* ------------------------------------------------------------------ */

export type MediaRow = typeof media.$inferSelect;
export type SectionRow = typeof pageSections.$inferSelect;
export type ServiceRow = typeof services.$inferSelect;
export type MarketRow = typeof markets.$inferSelect;
export type ProjectRow = typeof projects.$inferSelect;
export type ProjectMediaRow = typeof projectMedia.$inferSelect;
export type InsightRow = typeof insights.$inferSelect;
export type EnquiryRow = typeof enquiries.$inferSelect;
export type NavigationRow = typeof navigation.$inferSelect;
export type ApplianceRow = typeof calculatorAppliances.$inferSelect;
export type SeoRow = typeof seoMetadata.$inferSelect;
export type AdminUserRow = typeof adminUsers.$inferSelect;
