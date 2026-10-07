import Link from "next/link";
import { Logo, type LogoAssets } from "@/components/site/logo";
import type { SiteSettings } from "@/lib/settings-defaults";
import { telLink, waLink } from "@/lib/utils";

type LinkItem = { label: string; href: string };

export function Footer({
  settings,
  footerNav,
  services,
  markets,
  logo,
}: {
  settings: SiteSettings;
  footerNav: LinkItem[];
  services: LinkItem[];
  markets: LinkItem[];
  logo: LogoAssets;
}) {
  const year = new Date().getFullYear();
  const phones = [settings.phone_primary, settings.phone_secondary].filter(Boolean);
  const legal = footerNav.filter((i) => i.href === "/privacy" || i.href === "/terms");
  const company = footerNav.filter((i) => i.href !== "/privacy" && i.href !== "/terms");

  const col = (title: string, items: LinkItem[]) => (
    <div>
      <h3 className="eyebrow mb-5 text-white/70">{title}</h3>
      <ul className="space-y-2.5">
        {items.map((i) => (
          <li key={i.href + i.label}>
            <Link href={i.href} className="text-sm text-white/80 transition-colors hover:text-green-400">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <footer className="relative overflow-hidden bg-navy-950 text-white">
      <div className="grid-lines-dark absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 pt-20 pb-10">
        <div className="grid gap-14 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <Logo tone="light" brand={settings.brand_name} {...logo} />
            <p className="mt-6 max-w-sm text-base leading-relaxed text-white/70">{settings.tagline}</p>
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
            <div>
              <h3 className="eyebrow mb-5 text-white/70">Contact</h3>
              <ul className="space-y-2.5 text-sm">
                {phones.map((p) => (
                  <li key={p}>
                    <a href={telLink(p)} className="text-white/80 transition-colors hover:text-green-400">
                      {p}
                    </a>
                  </li>
                ))}
                {settings.whatsapp ? (
                  <li>
                    <a
                      href={waLink(settings.whatsapp, settings.whatsapp_default_message)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-white/80 transition-colors hover:text-green-400"
                    >
                      WhatsApp <span className="text-white/70">{settings.whatsapp}</span>
                    </a>
                  </li>
                ) : null}
                {settings.email ? (
                  <li>
                    <a href={`mailto:${settings.email}`} className="break-all text-white/80 transition-colors hover:text-green-400">
                      {settings.email}
                    </a>
                  </li>
                ) : null}
                {settings.reach ? <li className="pt-1 text-white/70">{settings.reach}</li> : null}
              </ul>
            </div>
            {col("Company", company)}
            {col("Services", services)}
            {col("Markets", markets)}
          </div>
        </div>

        <div className="hairline-dark mt-16" />

        <div className="mt-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="display text-lg text-white md:text-xl">{settings.closing_statement}</p>
            {settings.footer_note ? <p className="mt-2 text-sm text-white/60">{settings.footer_note}</p> : null}
            {legal.length ? (
              <ul className="mt-4 flex gap-5 text-xs text-white/70">
                {legal.map((i) => (
                  <li key={i.href}>
                    <Link href={i.href} className="hover:text-white">{i.label}</Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="text-left text-xs leading-relaxed text-white/70 md:text-right">
            <p>{settings.legal_name}</p>
            <p>{settings.rc_number}</p>
            <p className="mt-1">© {year} {settings.brand_name}. All rights reserved.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
