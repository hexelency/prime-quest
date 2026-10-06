import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import type { Prisma } from "@/generated/prisma";
import { removeListingMediaObjects } from "@/lib/server/listing-storage";
import { prismaListingData, serializeListing, validateListing } from "../route";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const { id } = await context.params;
    const validation = validateListing(await request.json(), true);
    if (validation.error) return NextResponse.json({ error: validation.error }, { status: 400 });
    if (!validation.listing || !Object.keys(validation.listing).length) return NextResponse.json({ error: "At least one listing field is required." }, { status: 400 });
    const listing = await requirePrisma().assetListing.update({ where: { id }, data: prismaListingData(validation.listing ?? {}) as Prisma.AssetListingUpdateInput });
    return NextResponse.json({ listing: serializeListing(listing as unknown as Record<string, unknown>) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update listing." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const { id } = await context.params;
    const prisma = requirePrisma();
    const media = await prisma.$queryRawUnsafe<Array<{ storagePath: string }>>(
      "SELECT storage_path AS \"storagePath\" FROM intake_attachments WHERE entity_type = 'listing' AND entity_id = $1::uuid",
      id,
    );
    const listing = await prisma.$transaction(async (transaction) => {
      await transaction.$executeRawUnsafe("DELETE FROM intake_attachments WHERE entity_type = 'listing' AND entity_id = $1::uuid", id);
      return transaction.assetListing.delete({ where: { id } });
    });
    await removeListingMediaObjects(media.map((item) => item.storagePath));
    return NextResponse.json({ listing: serializeListing(listing as unknown as Record<string, unknown>) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete listing." }, { status: 500 });
  }
}