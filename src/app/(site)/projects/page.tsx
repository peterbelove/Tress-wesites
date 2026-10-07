import type { Metadata } from "next";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/site/cards";
import { CTASection } from "@/components/site/cta-section";
import { PageHero } from "@/components/site/page-hero";
import { buildMetadata, getProjects, getSettings } from "@/lib/cms";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    path: "/projects",
    title: "Projects — Engineering, in the real world",
    description: "Selected renewable energy, electrical and security systems designed, installed and commissioned by TRES across Nigeria.",
  });
}

export default async function ProjectsPage() {
  const [projects, settings] = await Promise.all([getProjects(), getSettings()]);
  return (
    <>
      <PageHero
        title="ENGINEERING, IN THE REAL WORLD."
        subtitle="Systems designed, installed and commissioned by TRES. Each one started with an assessment of the actual load, structure and budget."
        crumbs={[{ label: "Projects" }]}
      />
      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
          {projects.length ? (
            <div className="grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((p, i) => (
                <Reveal key={p.id} delay={Math.min((i % 3) * 0.08, 0.3)}>
                  <ProjectCard project={p} />
                </Reveal>
              ))}
            </div>
          ) : (
            <div className="glass rounded-3xl p-12 text-center">
              <h2 className="display text-2xl text-navy">Projects are being prepared.</h2>
              <p className="mt-2 text-slate-ink">Published projects will appear here.</p>
            </div>
          )}
        </div>
      </section>
      <CTASection whatsapp={settings.whatsapp} whatsappMessage={settings.whatsapp_default_message} />
    </>
  );
}
