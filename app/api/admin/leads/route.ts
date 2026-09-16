import { NextResponse } from "next/server";
import { demoMarketBuyers } from "@/lib/demo-market-intelligence";
import { isDatabaseConfigured, selectFromSupabase, updateSupabase } from "@/lib/server/supabase";

export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json({ leads: demoMarketBuyers, database: "preview" });
  try {
    const leads = await selectFromSupabase("leads", { order: "created_at.desc" });
    return NextResponse.json({ leads, database: "connected" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load leads." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const body = await request.json() as { id?: string; status?: string; verification_status?: string };
    if (!body.id || (!body.status && !body.verification_status)) return NextResponse.json({ error: "A lead id and update are required." }, { status: 400 });
    const update = { ...(body.status ? { status: body.status } : {}), ...(body.verification_status ? { verification_status: body.verification_status } : {}) };
    const leads = await updateSupabase("leads", `id=eq.${encodeURIComponent(body.id)}`, update);
    return NextResponse.json({ lead: leads[0] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update lead." }, { status: 500 });
  }
}