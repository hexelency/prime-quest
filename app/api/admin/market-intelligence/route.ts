import { NextResponse } from "next/server";
import { demoMarketAssets, demoMarketBuyers } from "@/lib/demo-market-intelligence";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import { serializeListing, prismaListingData } from "../listings/route";
import { serializeLead } from "../leads/route";

export async function GET() {
  if (!isPrismaConfigured()) {
    return NextResponse.json({ assets: demoMarketAssets, buyers: demoMarketBuyers, database: "preview" });
  }

  try {
    const [assets, buyers] = await Promise.all([
      requirePrisma().assetListing.findMany({ orderBy: { createdAt: "desc" } }),
      requirePrisma().lead.findMany({ where: { kind: "buyer" }, orderBy: { createdAt: "desc" } }),
    ]);
    return NextResponse.json({ assets: assets.map((asset) => serializeListing(asset as unknown as Record<string, unknown>)), buyers: buyers.map((buyer) => serializeLead(buyer as unknown as Record<string, unknown>)), database: "connected" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load market intelligence." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  return NextResponse.json({ error: "Market intelligence review updates are not enabled yet." }, { status: 501 });
}

export async function POST(request: Request) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  try {
    const body = await request.json() as { record_type?: "asset" | "buyer"; record?: Record<string, unknown> };
    if (!body.record_type || !body.record) return NextResponse.json({ error: "record_type and record are required." }, { status: 400 });

    if (body.record_type === "asset") {
      const record = { ...body.record, discovered_by: body.record.discovered_by ?? "ai_agent", status: body.record.status ?? "discovered", verification_status: body.record.verification_status ?? "potential" };
      const inserted = await requirePrisma().assetListing.create({ data: prismaListingData(record) as never });
      return NextResponse.json({ record: serializeListing(inserted as unknown as Record<string, unknown>) }, { status: 201 });
    }
    const record = body.record;
    const inserted = await requirePrisma().lead.create({ data: {
      companyName: String(record.company_name ?? "").trim(), kind: "buyer", country: typeof record.country === "string" ? record.country : undefined,
      website: typeof record.website === "string" ? record.website : undefined, sourceUrl: typeof record.source_url === "string" ? record.source_url : undefined,
      sourceSummary: typeof record.source_summary === "string" ? record.source_summary : undefined,
      confidenceScore: typeof record.confidence_score === "number" ? record.confidence_score : undefined,
    } });
    return NextResponse.json({ record: inserted }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save market intelligence." }, { status: 500 });
  }
}