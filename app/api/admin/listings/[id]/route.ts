import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import type { Prisma } from "@prisma/client";
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
    const listing = await requirePrisma().assetListing.delete({ where: { id } });
    return NextResponse.json({ listing: serializeListing(listing as unknown as Record<string, unknown>) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete listing." }, { status: 500 });
  }
}