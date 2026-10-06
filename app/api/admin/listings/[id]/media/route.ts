import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import { getListingMedia } from "@/lib/server/listing-media";
import { listingMediaBucket, removeListingMediaObjects, validateListingMedia } from "@/lib/server/listing-storage";

type RouteContext = { params: Promise<{ id: string }> };
type NewMediaInput = { storage_path?: unknown; file_name?: unknown; mime_type?: unknown; file_size?: unknown };

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const runtime = "nodejs";

export async function POST(request: Request, context: RouteContext) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const { id } = await context.params;
    if (!uuidPattern.test(id)) return NextResponse.json({ error: "Invalid listing ID." }, { status: 400 });
    const body = await request.json() as { items?: unknown; remove_ids?: unknown; fallback_image_url?: unknown };
    const rawItems = Array.isArray(body.items) ? body.items : [];
    if (rawItems.some((item) => !item || typeof item !== "object" || Array.isArray(item))) {
      return NextResponse.json({ error: "Each uploaded media item must be a file record." }, { status: 400 });
    }
    const items = rawItems as NewMediaInput[];
    if (Array.isArray(body.remove_ids) && body.remove_ids.some((item) => typeof item !== "string" || !uuidPattern.test(item))) {
      return NextResponse.json({ error: "Invalid media removal request." }, { status: 400 });
    }
    const removeIds = Array.isArray(body.remove_ids) ? body.remove_ids.filter((item): item is string => typeof item === "string") : [];
    if (items.length > 3 || removeIds.length > 3) return NextResponse.json({ error: "A listing can have up to two images and one video." }, { status: 400 });

    const prisma = requirePrisma();
    const listing = await prisma.assetListing.findUnique({ where: { id }, select: { id: true } });
    if (!listing) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    const current = await prisma.$queryRawUnsafe<Array<{ id: string; fileName: string; storagePath: string; mimeType: string; fileSize: number }>>(
      "SELECT id, file_name AS \"fileName\", storage_path AS \"storagePath\", mime_type AS \"mimeType\", file_size AS \"fileSize\" FROM intake_attachments WHERE entity_type = 'listing' AND entity_id = $1::uuid ORDER BY created_at, id",
      id,
    );
    const removeSet = new Set(removeIds);
    if (removeSet.size !== removeIds.length || removeIds.some((removeId) => !current.some((media) => media.id === removeId))) {
      return NextResponse.json({ error: "One or more selected media items could not be found." }, { status: 400 });
    }
    const retained = current.filter((media) => !removeSet.has(media.id));
    const bucket = listingMediaBucket();
    const prefix = `supabase://${bucket}/listings/${id}/`;
    for (const item of items) {
      const validation = validateListingMedia(item.mime_type, item.file_size);
      if (validation.error) return NextResponse.json({ error: validation.error }, { status: 400 });
      if (typeof item.storage_path !== "string" || !item.storage_path.startsWith(prefix) || item.storage_path.includes("..") || item.storage_path.includes("\\")) {
        return NextResponse.json({ error: "The uploaded file does not belong to this listing." }, { status: 400 });
      }
      if (typeof item.file_name !== "string" || !item.file_name.trim()) return NextResponse.json({ error: "A file name is required for each media item." }, { status: 400 });
    }
    const imageCount = retained.filter((media) => media.mimeType.startsWith("image/")).length
      + items.filter((media) => typeof media.mime_type === "string" && media.mime_type.startsWith("image/")).length;
    const videoCount = retained.filter((media) => media.mimeType.startsWith("video/")).length
      + items.filter((media) => typeof media.mime_type === "string" && media.mime_type.startsWith("video/")).length;
    if (imageCount > 2 || videoCount > 1) return NextResponse.json({ error: "A listing can have up to two images and one video." }, { status: 400 });

    const removedPaths = current.filter((media) => removeSet.has(media.id)).map((media) => media.storagePath);
    await prisma.$transaction(async (transaction) => {
      if (removeIds.length) {
        await transaction.$executeRawUnsafe("DELETE FROM intake_attachments WHERE entity_type = 'listing' AND entity_id = $1::uuid AND id = ANY($2::uuid[])", id, removeIds);
      }
      for (const item of items) {
        const fileName = (item.file_name as string).trim().replace(/[^a-zA-Z0-9._ -]/g, "-").slice(-180);
        await transaction.$executeRawUnsafe(
          "INSERT INTO intake_attachments (entity_type, entity_id, file_name, storage_path, mime_type, file_size, content) VALUES ('listing', $1::uuid, $2, $3, $4, $5, decode('', 'hex'))",
          id, fileName, item.storage_path, item.mime_type, item.file_size,
        );
      }
    });

    try {
      const allMedia = await getListingMedia([id]);
      const media = allMedia.get(id) ?? [];
      const primaryImage = media.find((item) => item.type === "image")?.url
        ?? (typeof body.fallback_image_url === "string" ? body.fallback_image_url.trim().slice(0, 2000) || null : null);
      await prisma.assetListing.update({ where: { id }, data: { imageUrl: primaryImage } });
      await removeListingMediaObjects(removedPaths);
      return NextResponse.json({ media, image_url: primaryImage });
    } catch (error) {
      console.error("Listing media metadata was saved, but finalization failed:", error);
      return NextResponse.json({
        error: error instanceof Error ? `Listing media metadata was saved, but finalization failed: ${error.message}` : "Listing media metadata was saved, but finalization failed.",
      }, { status: 500 });
    }
  } catch (error) {
    console.error("Failed to save listing media:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save listing media." }, { status: 500 });
  }
}
