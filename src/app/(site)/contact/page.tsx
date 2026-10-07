import type { Metadata } from "next";
import { Suspense } from "react";
import { Reveal } from "@/components/motion/reveal";
import { EnquiryForm } from "@/components/site/enquiry-form";
import { PageHero } from "@/components/site/page-hero";
import { buildMetadata, getCalculatorConfig, getServices, getSettings } from "@/lib/cms";
import { telLink, waLink } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/contact",
    title: "Talk to TRES — Contact",
    description: "Tell us what you need to power, protect or improve. Reach TRES by phone, WhatsApp, email or the enquiry form.",
  });
}

export default async function ContactPage() {
  const [settings, services, { config }] = await Promise.all([getSettings(), getServices(), getCalculatorConfig()]);
  const phones = [settings.phone_primary, settings.phone_secondary].filter(Boolean);

  return (
    <>
      <PageHero
        title="TELL US WHAT YOU NEED TO POWER, PROTECT OR IMPROVE."
        subtitle="Share a few details and a TRES engineer will review them and get back to you. For anything urgent, WhatsApp is the fastest route."
        crumbs={[{ label: "Contact" }]}
        compact
      />
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          <div className="grid gap-16 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <Reveal>
                <dl className="divide-y divide-navy/10 border-y border-navy/10">
                  {phones.length ? (
                    <div className="py-6">
                      <dt className="eyebrow text-slate-ink">Phone</dt>
                      <dd className="mt-3 space-y-1.5">
                        {phones.map((p) => (
                          <a key={p} href={telLink(p)} className="block text-xl font-medium text-navy transition-colors hover:text-green">
                            {p}
                          </a>
                        ))}
                      </dd>
                    </div>
                  ) : null}
                  {settings.whatsapp ? (
                    <div className="py-6">
                      <dt className="eyebrow text-slate-ink">WhatsApp</dt>
                      <dd className="mt-3">
                        <a
                          href={waLink(settings.whatsapp, settings.whatsapp_default_message)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xl font-medium text-navy transition-colors hover:text-green"
                        >
                          {settings.whatsapp}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {settings.email ? (
                    <div className="py-6">
                      <dt className="eyebrow text-slate-ink">Email</dt>
                      <dd className="mt-3">
                        <a href={`mailto:${settings.email}`} className="break-all text-xl font-medium text-navy transition-colors hover:text-green">
                          {settings.email}
                        </a>
                      </dd>
                    </div>
                  ) : null}
                  {settings.reach ? (
                    <div className="py-6">
                      <dt className="eyebrow text-slate-ink">Reach</dt>
                      <dd className="mt-3 text-xl font-medium text-navy">{settings.reach}</dd>
                    </div>
                  ) : null}
                  {settings.address ? (
                    <div className="py-6">
                      <dt className="eyebrow text-slate-ink">Address</dt>
                      <dd className="mt-3 text-base text-navy">{settings.address}</dd>
                    </div>
                  ) : null}
                </dl>
              </Reveal>
            </div>
            <div className="lg:col-span-8">
              <Reveal delay={0.1} className="rounded-3xl border border-navy/10 p-6 md:p-10">
                <h2 className="display text-2xl text-navy">Send an enquiry</h2>
                <p className="mt-2 mb-8 text-sm text-slate-ink">Fields marked * are required.</p>
                <Suspense fallback={<div className="h-80 animate-pulse rounded-2xl bg-navy/5" />}>
                  <EnquiryForm
                    services={services.map((s) => ({ label: s.title, value: s.title }))}
                    propertyTypes={config.propertyTypes}
                  />
                </Suspense>
              </Reveal>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
