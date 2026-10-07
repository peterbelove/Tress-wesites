import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { ProjectCard } from "@/components/site/cards";
import { CTASection } from "@/components/site/cta-section";
import { MediaImage, MediaVideo } from "@/components/site/media-renderer";
import { PageHero } from "@/components/site/page-hero";
import { SectionHeading } from "@/components/site/section-heading";
import { GlassMetric } from "@/components/ui/glass";
import { getAdminUser } from "@/lib/auth";
import { buildMetadata, getProjectBySlug, getRelatedProjects, getSettings } from "@/lib/cms";
import { isPlaceholderCover, splitParagraphs } from "@/lib/utils";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<{ preview?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return { title: "Project not found" };
  return buildMetadata({
    path: `/projects/${slug}`,
    title: project.seoTitle || project.title,
    description: project.seoDescription || project.summary,
    image: isPlaceholderCover(project.cover) ? null : project.cover,
  });
}

function Narrative({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <Reveal className="grid gap-6 border-t border-navy/10 py-12 md:grid-cols-12">
      <div className="md:col-span-4">
        <h2 className="display text-2xl md:text-3xl text-navy">{title}</h2>
      </div>
      <div className="space-y-4 md:col-span-8">
        {splitParagraphs(body).map((p, i) => (
          <p key={i} className="text-lg leading-relaxed text-slate-ink">{p}</p>
        ))}
      </div>
    </Reveal>
  );
}

export default async function ProjectPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { preview } = await searchParams;
  const admin = preview ? await getAdminUser() : null;
  const project = await getProjectBySlug(slug, Boolean(admin));
  if (!project) notFound();
  const [settings, related] = await Promise.all([getSettings(), getRelatedProjects(project, 3)]);

  const images = project.gallery.filter((g) => g.media.type !== "video" && g.kind !== "video");
  const videos = project.gallery.filter((g) => g.media.type === "video" || g.kind === "video");
  const facts = [
    { label: "Location", value: project.location },
    { label: "Category", value: project.category },
    { label: "Project type", value: project.projectType },
    { label: "Client / label", value: project.clientLabel },
    { label: "Year", value: project.year },
  ].filter((f) => f.value);

  return (
    <>
      {!project.published ? (
        <div className="fixed inset-x-0 top-0 z-[60] bg-green px-4 py-1.5 text-center text-xs font-medium text-white">Preview — this project is not published</div>
      ) : null}
      <PageHero
        title={project.title}
        subtitle={project.summary}
        media={isPlaceholderCover(project.cover) ? null : project.cover}
        crumbs={[{ label: "Projects", href: "/projects" }, { label: project.title }]}
      >
        <div className="flex flex-wrap gap-3">
          {project.systemCapacity ? <GlassMetric label="System" value={project.systemCapacity} /> : null}
          {project.energyCapacity ? <GlassMetric label="Storage" value={project.energyCapacity} /> : null}
          {project.location ? (
            <div className="glass-dark flex items-center gap-2 rounded-2xl px-5 py-4 text-sm text-white"><MapPin className="h-4 w-4 text-green-400" />{project.location}</div>
          ) : null}
        </div>
      </PageHero>

      <section className="bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16 md:py-24">
          {facts.length ? (
            <Reveal className="grid gap-px overflow-hidden rounded-3xl border border-navy/10 bg-navy/10 sm:grid-cols-2 lg:grid-cols-5">
              {facts.map((f) => (
                <div key={f.label} className="bg-white p-5">
                  <div className="eyebrow text-slate-ink">{f.label}</div>
                  <div className="mt-2 text-sm font-medium text-navy">{f.value}</div>
                </div>
              ))}
            </Reveal>
          ) : null}

          <div className="mt-12">
            <Narrative title="The challenge" body={project.challenge} />
            <Narrative title="Our approach" body={project.approach} />
            <Narrative title="What we built" body={project.solution} />
            <Narrative title="The result" body={project.results} />
            {!project.challenge && !project.approach && !project.solution && !project.results ? (
              <Reveal className="rounded-3xl border border-navy/10 bg-mist p-8 text-sm text-slate-ink">
                Detailed project narrative and photography for this project will be published by TRES. System details shown above are as recorded in the TRES project record.
              </Reveal>
            ) : null}
          </div>
        </div>
      </section>

      {images.length ? (
        <section className="bg-navy-950">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <SectionHeading tone="dark" title="ON SITE." />
            <div className="mt-12 columns-1 gap-4 sm:columns-2 lg:columns-3 [&>*]:mb-4 [&>*]:break-inside-avoid">
              {images.map((g) => (
                <figure key={g.id} className="overflow-hidden rounded-2xl">
                  <MediaImage media={g.media} className="w-full" imgClassName="h-auto w-full" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                  {g.caption || g.kind !== "gallery" ? (
                    <figcaption className="px-1 pt-2 text-xs text-white/60">
                      {g.kind !== "gallery" ? <span className="mr-2 font-mono uppercase text-green-400">{g.kind}</span> : null}
                      {g.caption}
                    </figcaption>
                  ) : null}
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {videos.length ? (
        <section className="bg-navy">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <SectionHeading tone="dark" title="IN MOTION." />
            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {videos.map((v) => (
                <figure key={v.id}>
                  <div className="aspect-video overflow-hidden rounded-2xl bg-navy-950">
                    <MediaVideo media={v.media} poster={project.cover} controls autoPlay={false} />
                  </div>
                  {v.caption ? <figcaption className="pt-2 text-xs text-white/60">{v.caption}</figcaption> : null}
                </figure>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {related.length ? (
        <section className="bg-white">
          <div className="mx-auto max-w-7xl px-6 py-20 md:py-28">
            <SectionHeading title="MORE PROJECTS." action={{ label: "All projects", href: "/projects" }} />
            <div className="mt-12 grid gap-x-6 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <ProjectCard key={p.id} project={p} />
              ))}
            </div>
          </div>
        </section>
      ) : null}

      <CTASection whatsapp={settings.whatsapp} whatsappMessage={`Hello TRES, I saw the ${project.title} project and would like to discuss something similar.`} />
    </>
  );
}
