import { AdminPageHeader, Table } from "@/components/admin/admin-ui";
import { Field, Input, Notice, Select, SubmitButton } from "@/components/admin/form-bits";
import { deleteNavigationAction, saveNavigationAction } from "@/lib/admin-actions";
import { getAllNavigation } from "@/lib/cms";

export default async function NavigationAdmin({ searchParams }: { searchParams: Promise<{ saved?: string; deleted?: string }> }) {
  const { saved, deleted } = await searchParams;
  const rows = await getAllNavigation();
  const groups: Array<{ title: string; location: "header" | "footer" }> = [
    { title: "Header navigation", location: "header" },
    { title: "Footer — Company links", location: "footer" },
  ];
  return (
    <>
      <AdminPageHeader title="Navigation" description="Header links appear in the floating navigation. Services and Markets dropdowns are generated automatically from their sections when the link points to /services or /markets." />
      <div className="mb-6"><Notice saved={saved} deleted={deleted} /></div>
      <div className="space-y-10">
        {groups.map((g) => (
          <section key={g.location}>
            <h2 className="display mb-3 text-lg text-navy">{g.title}</h2>
            <Table head={["Label", "Link", "Order", "Visible", "New tab", ""]}>
              {rows.filter((r) => r.location === g.location).map((r) => (
                <tr key={r.id}>
                  <td colSpan={6} className="p-0">
                    <div className="flex flex-wrap items-center gap-2 px-4 py-2">
                      <form action={saveNavigationAction} className="flex flex-1 flex-wrap items-center gap-2">
                        <input type="hidden" name="id" value={r.id} />
                        <input type="hidden" name="location" value={r.location} />
                        <Input name="label" defaultValue={r.label} className="w-44" aria-label="Label" />
                        <Input name="href" defaultValue={r.href} className="w-56" aria-label="Link" />
                        <Input name="order" type="number" defaultValue={r.order} className="w-20" aria-label="Order" />
                        <label className="flex items-center gap-2 text-xs text-navy"><input type="checkbox" name="visible" defaultChecked={r.visible} className="accent-green" /> Visible</label>
                        <label className="flex items-center gap-2 text-xs text-navy"><input type="checkbox" name="openInNewTab" defaultChecked={r.openInNewTab} className="accent-green" /> New tab</label>
                        <SubmitButton variant="outline" className="py-2 text-xs">Save</SubmitButton>
                      </form>
                      <form action={deleteNavigationAction}>
                        <input type="hidden" name="id" value={r.id} />
                        <SubmitButton variant="danger" className="py-2 text-xs" confirm={`Remove “${r.label}”?`}>Remove</SubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </Table>
          </section>
        ))}
        <form action={saveNavigationAction} className="card-admin flex flex-wrap items-end gap-3">
          <h2 className="display w-full text-lg text-navy">Add link</h2>
          <Field label="Location"><Select name="location" defaultValue="header"><option value="header">Header</option><option value="footer">Footer</option></Select></Field>
          <Field label="Label"><Input name="label" required className="w-44" /></Field>
          <Field label="Link"><Input name="href" required placeholder="/projects" className="w-56" /></Field>
          <Field label="Order"><Input name="order" type="number" defaultValue={rows.length} className="w-24" /></Field>
          <label className="flex items-center gap-2 pb-3 text-xs text-navy"><input type="checkbox" name="visible" defaultChecked className="accent-green" /> Visible</label>
          <SubmitButton>Add link</SubmitButton>
        </form>
      </div>
    </>
  );
}
