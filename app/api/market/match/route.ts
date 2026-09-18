import { NextResponse } from "next/server";
import { availableListings } from "@/lib/available-listings";
import { demoMarketAssets } from "@/lib/demo-market-intelligence";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

type MatchRequest = { request?: unknown; category?: unknown; asset_type?: unknown; location?: unknown; budget?: unknown; contact_name?: unknown; contact_email?: unknown };
const categories = ["vessel", "property", "land", "track_farm", "energy"] as const;

function clean(value: unknown) { return typeof value === "string" ? value.trim().slice(0, 500) : ""; }
function tokenize(value: string) { return value.toLowerCase().split(/[^a-z0-9]+/).filter((part) => part.length > 2); }

function publicCard(listing: Record<string, unknown>) {
  return {
    reference: listing.reference ?? listing.ref,
    category: listing.category,
    asset_type: listing.asset_type ?? listing.type,
    availability: "Available through PrimeQuest",
    location: "Location shared after qualification",
    details: "Specifications, seller identity and commercial terms shared with qualified parties.",
  };
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as MatchRequest;
    const requestText = clean(body.request);
    const category = clean(body.category).toLowerCase();
    const assetType = clean(body.asset_type).toLowerCase();
    const location = clean(body.location).toLowerCase();
    if (!requestText && !category && !assetType && !location) return NextResponse.json({ error: "Describe what you are looking for." }, { status: 400 });

    let listings: Record<string, unknown>[];
    if (isPrismaConfigured()) {
      const records = await requirePrisma().assetListing.findMany({ where: { status: "published", verificationStatus: { in: ["confirmed", "verified"] } }, orderBy: { createdAt: "desc" }, take: 50 });
      listings = records as unknown as Record<string, unknown>[];
    } else {
      listings = [...demoMarketAssets, ...availableListings].filter((listing) => "category" in listing ? true : false) as unknown as Record<string, unknown>[];
    }
    const terms = tokenize(`${requestText} ${category} ${assetType} ${location}`);
    const matches = listings.map((listing) => {
      const searchable = tokenize(`${listing.title ?? ""} ${listing.asset_type ?? listing.type ?? ""} ${listing.category ?? ""} ${listing.location ?? ""}`);
      const score = terms.length ? Math.round((terms.filter((term) => searchable.includes(term)).length / terms.length) * 100) : 0;
      return { listing, score };
    }).filter(({ score }) => score >= (terms.length ? 20 : 0)).sort((left, right) => right.score - left.score).slice(0, 6);

    let requestId: string | undefined;
    if (isPrismaConfigured()) {
      const saved = await requirePrisma().buyerRequest.create({ data: { requestText: requestText || `${category} ${assetType} ${location}`.trim(), category: categories.includes(category as typeof categories[number]) ? category as typeof categories[number] : undefined, assetType: assetType || undefined, location: location || undefined, budget: clean(body.budget) || undefined, contactName: clean(body.contact_name) || undefined, contactEmail: clean(body.contact_email) || undefined } });
      requestId = saved.id;
    }
    return NextResponse.json({ request_id: requestId, matches: matches.map(({ listing, score }) => ({ ...publicCard(listing), match_score: score })), message: matches.length ? "We found opportunities that may fit. A PrimeQuest representative will share qualified details." : "We will review the request and contact you when a suitable opportunity is available." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not match this request." }, { status: 500 });
  }
}