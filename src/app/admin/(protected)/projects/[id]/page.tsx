import { notFound } from "next/navigation";
import { AdminPageHeader, Badge } from "@/components/admin/admin-ui";
import { Checkbox, Field, Input, Notice, SubmitButton, Textarea } from "@/components/admin/form-bits";
import { MediaMultiPicker, MediaPicker } from "@/components/admin/media-picker";
import { deleteProjectAction, duplicateProjectAction, saveProjectAction } from "@/lib/admin-actions";
import { getProjectById } from "@/lib/cms";

export default async function ProjectEdit({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; duplicated?: string }> }) {
  const { id } = await params;
  const { saved, duplicated } = await searchParams;
  const isNew = id === "new";
  const project = isNew ? null : await getProjectById(parseInt(id, 10));
  if (!isNew && !project) notFound();
  const gallery = (project?.gallery ?? []).map((g) => ({ mediaId: g.mediaId, kind: g.kind, caption: g.caption, media: g.media }));

  return (
    <>
      <AdminPageHeader
        title={isNew ? "New project" : project!.title}
        description={project ? `/projects/${project.slug}` : "Create a new project record. Only enter details that are verified."}
        backHref="/admin/projects"
        backLabel="Projects"
        actions={project ? (
          <>
            <Badge tone={project.published ? "green" : "amber"}>{project.published ? "Published" : "Draft"}</Badge>
            <a href={`/projects/${project.slug}?preview=1`} target="_blank" className="btn-outline py-2 text-sm">Preview</a>
          </>
        ) : null}
      />
      <div className="mb-6"><Notice saved={saved} duplicated={duplicated} /></div>

      <form action={saveProjectAction} className="space-y-6">
        {project ? <input type="hidden" name="id" value={project.id} /> : null}
        <div className="card-admin grid gap-5 md:grid-cols-2">
          <Field label="Title"><Input name="title" defaultValue={project?.title} required /></Field>
          <Field label="Slug" hint="URL: /projects/slug"><Input name="slug" defaultValue={project?.slug} placeholder="auto from title" /></Field>
          <Field label="Category" hint="e.g. Residential Solar + Storage"><Input name="category" defaultValue={project?.category} /></Field>
          <Field label="Project type" hint="Residential, Commercial, Industrial…"><Input name="projectType" defaultValue={project?.projectType} /></Field>
          <Field label="Location"><Input name="location" defaultValue={project?.location} placeholder="City, State" /></Field>
          <Field label="Client / project label" hint="Only use a client's name with their written consent."><Input name="clientLabel" defaultValue={project?.clientLabel} /></Field>
          <Field label="Year"><Input name="year" defaultValue={project?.year} placeholder="Leave blank if unknown" /></Field>
          <Field label="Display order"><Input name="order" type="number" defaultValue={project?.order ?? 0} /></Field>
          <Field label="System capacity" hint="e.g. 6.2 kW solar"><Input name="systemCapacity" defaultValue={project?.systemCapacity} /></Field>
          <Field label="Energy capacity" hint="e.g. 15 kWh storage"><Input name="energyCapacity" defaultValue={project?.energyCapacity} /></Field>
          <Field label="Summary" className="md:col-span-2"><Textarea name="summary" defaultValue={project?.summary} rows={3} className="font-sans" /></Field>
        </div>

        <div className="card-admin grid gap-5">
          <h2 className="display text-lg text-navy">Project story</h2>
          <p className="-mt-3 text-xs text-slate-ink">Leave sections blank if details are not verified — they are hidden automatically.</p>
          <Field label="Challenge — what was the problem?"><Textarea name="challenge" defaultValue={project?.challenge} rows={4} /></Field>
          <Field label="Engineering approach — what did TRES understand?"><Textarea name="approach" defaultValue={project?.approach} rows={4} /></Field>
          <Field label="Solution — what did TRES engineer and install?"><Textarea name="solution" defaultValue={project?.solution} rows={4} /></Field>
          <Field label="Results — what changed? (verified outcomes only)"><Textarea name="results" defaultValue={project?.results} rows={4} /></Field>
        </div>

        <div className="card-admin grid gap-6">
          <MediaPicker name="coverMediaId" label="Cover image" value={project?.cover ?? null} typeFilter="image" />
          <MediaMultiPicker name="gallery" label="Gallery, drone footage, before/after, diagrams & videos" value={gallery} />
        </div>

        <div className="card-admin grid gap-5 md:grid-cols-2">
          <Checkbox name="published" label="Published" hint="Visible to the public." defaultChecked={project?.published ?? false} />
          <Checkbox name="featured" label="Featured on homepage" defaultChecked={project?.featured ?? false} />
          <Field label="SEO title"><Input name="seoTitle" defaultValue={project?.seoTitle} /></Field>
          <Field label="SEO description"><Input name="seoDescription" defaultValue={project?.seoDescription} /></Field>
        </div>
        <div className="flex justify-end gap-2"><SubmitButton>{isNew ? "Create project" : "Save changes"}</SubmitButton></div>
      </form>

      {project ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <form action={duplicateProjectAction} className="flex items-center justify-between rounded-2xl border border-navy/10 bg-white p-4">
            <input type="hidden" name="id" value={project.id} />
            <span className="text-sm text-navy">Duplicate as a new draft.</span>
            <SubmitButton variant="outline">Duplicate</SubmitButton>
          </form>
          <form action={deleteProjectAction} className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50/50 p-4">
            <input type="hidden" name="id" value={project.id} />
            <span className="text-sm text-red-700">Delete this project permanently.</span>
            <SubmitButton variant="danger" confirm="Delete this project and its gallery links? This cannot be undone.">Delete</SubmitButton>
          </form>
        </div>
      ) : null}
    </>
  );
}
