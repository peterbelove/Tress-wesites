export const DEFAULT_SETTINGS = {
  brand_name: "TRES",
  legal_name: "The Rock Engineering Solution Limited",
  rc_number: "RC 9776971",
  tagline: "Engineering better lives through renewable energy and technology.",
  closing_statement:
    "Engineering better lives through renewable energy and technology, built to last.",
  philosophy: "The right work. The right way. For the right people.",
  phone_primary: "09130703970",
  phone_secondary: "07033979488",
  whatsapp: "+234 703 397 9488",
  email: "tresengineeringltd@gmail.com",
  reach: "Ibadan, Lagos, Nationwide",
  address: "",
  whatsapp_default_message: "Hello TRES, I would like to discuss an engineering project.",
  header_cta_label: "Talk to TRES",
  header_cta_href: "/contact",
  show_whatsapp_button: "true",
  logo_media_id: "",
  logo_light_media_id: "",
  logo_show_wordmark: "true",
  site_url: "",
  default_seo_title: "TRES — Engineering better lives through renewable energy and technology",
  default_seo_description:
    "TRES engineers reliable renewable energy, electrical, smart security and automation systems across Nigeria — designed around your actual load, structure and budget.",
  social_instagram: "",
  social_linkedin: "",
  social_facebook: "",
  social_x: "",
  footer_note: "",
} as const;

export type SettingsKey = keyof typeof DEFAULT_SETTINGS;
export type SiteSettings = Record<SettingsKey, string>;

export const SETTINGS_GROUPS: { title: string; keys: SettingsKey[]; hint?: string }[] = [
  {
    title: "Brand & identity",
    keys: ["brand_name", "legal_name", "rc_number", "tagline", "closing_statement", "philosophy"],
    hint: "The registered company name and RC number appear discreetly in the footer and on the legal pages.",
  },
  {
    title: "Contact",
    keys: ["phone_primary", "phone_secondary", "whatsapp", "email", "reach", "address", "whatsapp_default_message"],
    hint: "Both phone numbers are shown independently and are clickable. WhatsApp is configured separately and powers the floating button and all WhatsApp CTAs.",
  },
  {
    title: "Logo, header & floating actions",
    keys: ["logo_media_id", "logo_light_media_id", "logo_show_wordmark", "header_cta_label", "header_cta_href", "show_whatsapp_button"],
    hint: "Upload the official TRES mark in the Media Library and select it as the logo. The light variant is used on dark backgrounds (footer, transparent header). Set logo_show_wordmark to false if the uploaded file already contains the TRES wordmark.",
  },
  {
    title: "SEO defaults",
    keys: ["site_url", "default_seo_title", "default_seo_description"],
  },
  {
    title: "Social",
    keys: ["social_instagram", "social_linkedin", "social_facebook", "social_x"],
  },
  { title: "Footer", keys: ["footer_note"] },
];
