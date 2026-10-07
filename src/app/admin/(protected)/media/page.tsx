import { AdminPageHeader } from "@/components/admin/admin-ui";
import { MediaLibrary, MediaUploader } from "@/components/admin/media-library";
import { getAllMedia } from "@/lib/cms";

export default async function MediaPage() {
  const items = await getAllMedia();
  return (
    <>
      <AdminPageHeader
        title="Media Library"
        description="Upload, replace, categorise and remove images and videos. Any content referencing a media item updates instantly across the website."
      />
      <div className="space-y-6">
        <MediaUploader />
        <MediaLibrary initialItems={items} />
      </div>
    </>
  );
}
