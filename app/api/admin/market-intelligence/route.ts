import { NextResponse } from "next/server";
import { demoMarketAssets, demoMarketBuyers } from "@/lib/demo-market-intelligence";
import { insertIntoSupabase, isDatabaseConfigured, selectFromSupabase } from "@/lib/server/supabase";

export async function GET() {
  if (!isDatabaseConfigured()) {
    return NextResponse.json({ assets: demoMarketAssets, buyers: demoMarketBuyers, database: "preview" });
  }

  try {
    const [assets, buyers] = await Promise.all([
      selectFromSupabase("asset_listings", { order: "created_at.desc" }),
      selectFromSupabase("leads", { kind: "eq.buyer", order: "created_at.desc" }),
    ]);
    return NextResponse.json({ assets, buyers, database: "connected" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load market intelligence." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  return NextResponse.json({ error: "Market intelligence review updates are not enabled yet." }, { status: 501 });
}

export async function POST(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  try {
    const body = await request.json() as { record_type?: "asset" | "buyer"; record?: Record<string, unknown> };
    if (!body.record_type || !body.record) return NextResponse.json({ error: "record_type and record are required." }, { status: 400 });

    const record = body.record_type === "asset"
      ? { ...body.record, discovered_by: body.record.discovered_by ?? "ai_agent", status: body.record.status ?? "discovered", verification_status: body.record.verification_status ?? "potential" }
      : { ...body.record, kind: "buyer", status: body.record.status ?? "discovered", verification_status: body.record.verification_status ?? "potential" };
    const table = body.record_type === "asset" ? "asset_listings" : "leads";
    const inserted = await insertIntoSupabase(table, record);
    return NextResponse.json({ record: inserted[0] }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not save market intelligence." }, { status: 500 });
  }
}