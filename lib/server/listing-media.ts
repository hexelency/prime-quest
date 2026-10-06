import { requirePrisma } from "@/lib/server/prisma";
import { publicListingMediaUrl } from "@/lib/server/listing-storage";

type ListingMediaRow = {
  id: string;
  entityId: string;
  fileName: string;
  storagePath: string;
  mimeType: string;
};

export type ListingMedia = {
  id: string;
  type: "image" | "video";
  url: string;
  fileName: string;
};

export async function getListingMedia(listingIds: string[]) {
  const mediaByListing = new Map<string, ListingMedia[]>();
  if (!listingIds.length) return mediaByListing;
  const rows = await requirePrisma().$queryRawUnsafe<ListingMediaRow[]>(
    "SELECT id, entity_id AS \"entityId\", file_name AS \"fileName\", storage_path AS \"storagePath\", mime_type AS \"mimeType\" FROM intake_attachments WHERE entity_type = 'listing' AND entity_id = ANY($1::uuid[]) ORDER BY created_at, id",
    listingIds,
  );
  for (const row of rows) {
    const media = mediaByListing.get(row.entityId) ?? [];
    media.push({
      id: row.id,
      type: row.mimeType.startsWith("video/") ? "video" : "image",
      url: publicListingMediaUrl(row.storagePath),
      fileName: row.fileName,
    });
    mediaByListing.set(row.entityId, media);
  }
  return mediaByListing;
}
