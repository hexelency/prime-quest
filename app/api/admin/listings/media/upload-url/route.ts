import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import { createListingUploadUrl, validateListingMedia } from "@/lib/server/listing-storage";

export const runtime = "nodejs";

const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const body = await request.json() as { listing_id?: unknown; file_name?: unknown; mime_type?: unknown; file_size?: unknown };
    if (typeof body.listing_id !== "string" || !uuidPattern.test(body.listing_id)) {
      return NextResponse.json({ error: "A valid listing ID is required for media uploads." }, { status: 400 });
    }
    if (typeof body.file_name !== "string" || !body.file_name.trim()) {
      return NextResponse.json({ error: "A file name is required." }, { status: 400 });
    }
    const validation = validateListingMedia(body.mime_type, body.file_size);
    if (validation.error) return NextResponse.json({ error: validation.error }, { status: 400 });
    const listing = await requirePrisma().assetListing.findUnique({ where: { id: body.listing_id }, select: { id: true } });
    if (!listing) return NextResponse.json({ error: "Save the listing before uploading its media." }, { status: 404 });
    const result = await createListingUploadUrl(body.listing_id, body.file_name.trim().slice(0, 180), body.mime_type as string);
    return NextResponse.json({ ...result, type: validation.mediaType });
  } catch (error) {
    console.error("Failed to prepare listing media upload:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not prepare listing media upload." }, { status: 500 });
  }
}
