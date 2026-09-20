import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import type { Prisma } from "@/generated/prisma";

const categories = ["vessel", "property", "land", "track_farm", "energy"] as const;
const statuses = ["discovered", "under_review", "approved", "published", "withdrawn"] as const;
const verificationStatuses = ["potential", "confirmed", "under_review", "verified", "rejected"] as const;

type ListingInput = {
  reference?: unknown;
  title?: unknown;
  category?: unknown;
  asset_type?: unknown;
  imo_number?: unknown;
  verification_details?: unknown;
  location?: unknown;
  summary?: unknown;
  source_url?: unknown;
  source_platform?: unknown;
  source_summary?: unknown;
  image_url?: unknown;
  tags?: unknown;
  discovered_by?: unknown;
  confidence_score?: unknown;
  status?: unknown;
  verification_status?: unknown;
  published_at?: unknown;
  risk_flags?: unknown;
};

function text(value: unknown, maxLength?: number) {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const normalized = value.trim();
  return maxLength ? normalized.slice(0, maxLength) : normalized;
}

function validateListing(input: ListingInput, partial = false) {
  const listing = {
    ...(text(input.reference) ? { reference: text(input.reference) } : {}),
    ...(text(input.title) ? { title: text(input.title) } : {}),
    ...(categories.includes(input.category as typeof categories[number]) ? { category: input.category } : {}),
    ...(text(input.asset_type) ? { asset_type: text(input.asset_type) } : {}),
    ...(text(input.imo_number) ? { imo_number: text(input.imo_number) } : {}),
    ...(text(input.verification_details) ? { verification_details: text(input.verification_details, 2000) } : {}),
    ...(text(input.location) ? { location: text(input.location) } : {}),
    ...(text(input.summary) ? { summary: text(input.summary) } : {}),
    ...(text(input.source_url) ? { source_url: text(input.source_url) } : {}),
    ...(text(input.source_platform) ? { source_platform: text(input.source_platform) } : {}),
    ...(text(input.source_summary) ? { source_summary: text(input.source_summary) } : {}),
    ...(text(input.image_url) ? { image_url: text(input.image_url) } : {}),
    ...(Array.isArray(input.tags) ? { tags: input.tags.filter((tag): tag is string => typeof tag === "string") } : {}),
    ...(text(input.discovered_by) ? { discovered_by: text(input.discovered_by) } : {}),
    ...(typeof input.confidence_score === "number" ? { confidence_score: input.confidence_score } : {}),
    ...(statuses.includes(input.status as typeof statuses[number]) ? { status: input.status } : {}),
    ...(verificationStatuses.includes(input.verification_status as typeof verificationStatuses[number]) ? { verification_status: input.verification_status } : {}),
    ...(typeof input.published_at === "string" && !Number.isNaN(Date.parse(input.published_at)) ? { published_at: input.published_at } : {}),
    ...(Array.isArray(input.risk_flags) ? { risk_flags: input.risk_flags } : {}),
  };
  const required = ["reference", "title", "category", "asset_type"] as const;
  const missing = partial ? [] : required.filter((field) => !(field in listing));
  if (missing.length) return { error: `Missing required fields: ${missing.join(", ")}` };
  if ("confidence_score" in listing && (listing.confidence_score as number) < 0 || "confidence_score" in listing && (listing.confidence_score as number) > 100) return { error: "confidence_score must be between 0 and 100." };
  if (input.category !== undefined && !("category" in listing)) return { error: "Invalid listing category." };
  if (input.status !== undefined && !("status" in listing)) return { error: "Invalid listing status." };
  if (input.verification_status !== undefined && !("verification_status" in listing)) return { error: "Invalid verification status." };
  return { listing };
}

export function serializeListing(listing: Record<string, unknown>) {
  return {
    id: listing.id,
    reference: listing.reference,
    title: listing.title,
    category: listing.category,
    asset_type: listing.assetType,
    imo_number: listing.imoNumber,
    verification_details: listing.verificationDetails,
    location: listing.location,
    summary: listing.summary,
    source_url: listing.sourceUrl,
    source_platform: listing.sourcePlatform,
    source_summary: listing.sourceSummary,
    image_url: listing.imageUrl,
    tags: listing.tags,
    discovered_by: listing.discoveredBy,
    confidence_score: listing.confidenceScore,
    status: listing.status,
    verification_status: listing.verificationStatus,
    risk_flags: listing.riskFlags,
    published_at: listing.publishedAt,
    last_researched_at: listing.lastResearchedAt,
    created_at: listing.createdAt,
    updated_at: listing.updatedAt,
  };
}

export function prismaListingData(listing: Record<string, unknown>) {
  return {
    ...(listing.reference ? { reference: listing.reference as string } : {}),
    ...(listing.title ? { title: listing.title as string } : {}),
    ...(listing.category ? { category: listing.category as typeof categories[number] } : {}),
    ...(listing.asset_type ? { assetType: listing.asset_type as string } : {}),
    ...(listing.imo_number ? { imoNumber: listing.imo_number as string } : {}),
    ...(listing.verification_details ? { verificationDetails: listing.verification_details as string } : {}),
    ...(listing.location ? { location: listing.location as string } : {}),
    ...(listing.summary ? { summary: listing.summary as string } : {}),
    ...(listing.source_url ? { sourceUrl: listing.source_url as string } : {}),
    ...(listing.source_platform ? { sourcePlatform: listing.source_platform as string } : {}),
    ...(listing.source_summary ? { sourceSummary: listing.source_summary as string } : {}),
    ...(listing.image_url ? { imageUrl: listing.image_url as string } : {}),
    ...(Array.isArray(listing.tags) ? { tags: listing.tags } : {}),
    ...(listing.discovered_by ? { discoveredBy: listing.discovered_by as string } : {}),
    ...(typeof listing.confidence_score === "number" ? { confidenceScore: listing.confidence_score } : {}),
    ...(listing.status ? { status: listing.status as typeof statuses[number] } : {}),
    ...(listing.verification_status ? { verificationStatus: listing.verification_status as typeof verificationStatuses[number] } : {}),
    ...(Array.isArray(listing.risk_flags) ? { riskFlags: listing.risk_flags } : {}),
    ...(listing.published_at ? { publishedAt: new Date(listing.published_at as string) } : {}),
  };
}

export async function GET(request: Request) {
  if (!isPrismaConfigured()) return NextResponse.json({ listings: [], database: "preview" });
  const url = new URL(request.url);
  try {
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    const listings = await requirePrisma().assetListing.findMany({
      where: {
        ...(categories.includes(category as typeof categories[number]) ? { category: category as typeof categories[number] } : {}),
        ...(statuses.includes(status as typeof statuses[number]) ? { status: status as typeof statuses[number] } : {}),
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ listings: listings.map((listing: Record<string, unknown>) => serializeListing(listing)), database: "connected" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load listings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const validation = validateListing(await request.json() as ListingInput);
    if (validation.error) return NextResponse.json({ error: validation.error }, { status: 400 });
    const listing = await requirePrisma().assetListing.create({ data: prismaListingData(validation.listing ?? {}) as Prisma.AssetListingCreateInput });
    return NextResponse.json({ listing: serializeListing(listing as unknown as Record<string, unknown>) }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create listing." }, { status: 500 });
  }
}

export { validateListing };