import { NextResponse } from "next/server";
import { insertIntoSupabase, isDatabaseConfigured, selectFromSupabase } from "@/lib/server/supabase";

const categories = ["vessel", "property", "land", "track_farm", "energy"] as const;
const statuses = ["discovered", "under_review", "approved", "published", "withdrawn"] as const;
const verificationStatuses = ["potential", "confirmed", "under_review", "verified", "rejected"] as const;

type ListingInput = {
  reference?: unknown;
  title?: unknown;
  category?: unknown;
  asset_type?: unknown;
  location?: unknown;
  summary?: unknown;
  source_url?: unknown;
  source_platform?: unknown;
  source_summary?: unknown;
  discovered_by?: unknown;
  confidence_score?: unknown;
  status?: unknown;
  verification_status?: unknown;
  risk_flags?: unknown;
};

function text(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function validateListing(input: ListingInput, partial = false) {
  const listing = {
    ...(text(input.reference) ? { reference: text(input.reference) } : {}),
    ...(text(input.title) ? { title: text(input.title) } : {}),
    ...(categories.includes(input.category as typeof categories[number]) ? { category: input.category } : {}),
    ...(text(input.asset_type) ? { asset_type: text(input.asset_type) } : {}),
    ...(text(input.location) ? { location: text(input.location) } : {}),
    ...(text(input.summary) ? { summary: text(input.summary) } : {}),
    ...(text(input.source_url) ? { source_url: text(input.source_url) } : {}),
    ...(text(input.source_platform) ? { source_platform: text(input.source_platform) } : {}),
    ...(text(input.source_summary) ? { source_summary: text(input.source_summary) } : {}),
    ...(text(input.discovered_by) ? { discovered_by: text(input.discovered_by) } : {}),
    ...(typeof input.confidence_score === "number" ? { confidence_score: input.confidence_score } : {}),
    ...(statuses.includes(input.status as typeof statuses[number]) ? { status: input.status } : {}),
    ...(verificationStatuses.includes(input.verification_status as typeof verificationStatuses[number]) ? { verification_status: input.verification_status } : {}),
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

export async function GET(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ listings: [], database: "preview" });
  const url = new URL(request.url);
  const query: Record<string, string> = { order: "created_at.desc" };
  if (url.searchParams.get("category")) query.category = `eq.${url.searchParams.get("category")}`;
  if (url.searchParams.get("status")) query.status = `eq.${url.searchParams.get("status")}`;
  try {
    return NextResponse.json({ listings: await selectFromSupabase("asset_listings", query), database: "connected" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load listings." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const validation = validateListing(await request.json() as ListingInput);
    if (validation.error) return NextResponse.json({ error: validation.error }, { status: 400 });
    const inserted = await insertIntoSupabase("asset_listings", validation.listing ?? {});
    return NextResponse.json({ listing: inserted[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create listing." }, { status: 500 });
  }
}

export { validateListing };