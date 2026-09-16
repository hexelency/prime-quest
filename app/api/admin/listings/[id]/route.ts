import { NextResponse } from "next/server";
import { deleteFromSupabase, isDatabaseConfigured, updateSupabase } from "@/lib/server/supabase";
import { validateListing } from "../route";

type RouteContext = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, context: RouteContext) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const { id } = await context.params;
    const validation = validateListing(await request.json(), true);
    if (validation.error) return NextResponse.json({ error: validation.error }, { status: 400 });
    if (!validation.listing || !Object.keys(validation.listing).length) return NextResponse.json({ error: "At least one listing field is required." }, { status: 400 });
    const updated = await updateSupabase("asset_listings", `id=eq.${encodeURIComponent(id)}`, { ...validation.listing, updated_at: new Date().toISOString() });
    if (!updated.length) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    return NextResponse.json({ listing: updated[0] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update listing." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const { id } = await context.params;
    const deleted = await deleteFromSupabase("asset_listings", `id=eq.${encodeURIComponent(id)}`);
    if (!deleted.length) return NextResponse.json({ error: "Listing not found." }, { status: 404 });
    return NextResponse.json({ listing: deleted[0] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete listing." }, { status: 500 });
  }
}