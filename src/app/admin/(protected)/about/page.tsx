import { AdminPageHeader } from "@/components/admin/admin-ui";
import { SectionList } from "@/components/admin/section-list";
import { getSectionRows } from "@/lib/cms";

export default async function AboutAdmin() {
  const [about, privacy, terms] = await Promise.all([getSectionRows("about"), getSectionRows("privacy"), getSectionRows("terms")]);
  return (
    <>
      <AdminPageHeader title="About & Legal" description="About page sections, founder message, mission, vision, beliefs — plus the Privacy Policy and Terms of Use content." />
      <div className="space-y-10">
        <SectionList sections={about} title="About page" />
        <SectionList sections={[...privacy, ...terms]} title="Legal pages" />
      </div>
    </>
  );
}
