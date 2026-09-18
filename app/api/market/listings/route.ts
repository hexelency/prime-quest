import { NextResponse } from "next/server";
import { getPublishedAvailableListings } from "@/lib/server/available-listings";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ listings: await getPublishedAvailableListings() });
  } catch (error) {
    console.error("Failed to load marketplace listings:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load listings.", databaseHost: process.env.DIRECT_URL ? new URL(process.env.DIRECT_URL).hostname : "not configured" }, { status: 500 });
  }
}