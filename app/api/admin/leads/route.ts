import { NextResponse } from "next/server";
import { isDatabaseConfigured, selectFromSupabase, updateSupabase } from "@/lib/server/supabase";

const previewLeads = [
  { id: "lead-abc", company_name: "ABC Petroleum", kind: "buyer", country: "Ghana", website: "abcpetroleum.example", source_url: "https://example.com/market-update", source_summary: "Public expansion signal in fuel distribution operations.", confidence_score: 89, status: "researched", verification_status: "potential", risk_flags: ["No direct confirmation"], created_at: "2026-09-14" },
  { id: "lead-coast", company_name: "Coastline Energy Trading", kind: "buyer", country: "Nigeria", website: "coastline.example", source_url: "https://example.com/tender", source_summary: "Appears in a public procurement announcement for diesel supply.", confidence_score: 76, status: "discovered", verification_status: "potential", risk_flags: ["Tender status needs confirmation"], created_at: "2026-09-13" },
  { id: "lead-north", company_name: "Northstar Refining Partners", kind: "seller", country: "United Arab Emirates", website: "northstar.example", source_url: "https://example.com/company", source_summary: "Public company profile references refined product supply capabilities.", confidence_score: 72, status: "contacted", verification_status: "confirmed", risk_flags: ["Authority documents not reviewed"], created_at: "2026-09-12" },
  { id: "lead-delta", company_name: "Delta Commercial Fuels", kind: "buyer", country: "Ghana", website: "deltafuels.example", source_url: "https://example.com/news", source_summary: "Recent distribution network announcement suggests potential demand.", confidence_score: 64, status: "discovered", verification_status: "potential", risk_flags: ["No named procurement contact"], created_at: "2026-09-11" },
  { id: "lead-atlas", company_name: "Atlas Marine Supply", kind: "seller", country: "Nigeria", website: "atlasmarine.example", source_url: "https://example.com/directory", source_summary: "Listed in a public marine services directory.", confidence_score: 51, status: "researched", verification_status: "under_review", risk_flags: ["Duplicate check pending"], created_at: "2026-09-10" },
];

export async function GET() {
  if (!isDatabaseConfigured()) return NextResponse.json({ leads: previewLeads, database: "preview" });

  try {
    const leads = await selectFromSupabase("leads", { order: "confidence_score.desc,created_at.desc" });
    return NextResponse.json({ leads, database: "connected" });
  } catch {
    return NextResponse.json({ error: "Could not load leads from the database." }, { status: 502 });
  }
}

export async function PATCH(request: Request) {
  if (!isDatabaseConfigured()) return NextResponse.json({ error: "Connect Supabase before changing lead records." }, { status: 503 });

  try {
    const body = await request.json() as { id?: string; status?: string; verification_status?: string };
    if (!body.id || (!body.status && !body.verification_status)) return NextResponse.json({ error: "A lead id and update are required." }, { status: 400 });
    const allowedStatuses = ["discovered", "researched", "contacted", "interested", "registered", "rejected"];
    const allowedVerification = ["potential", "confirmed", "under_review", "verified", "rejected"];
    if ((body.status && !allowedStatuses.includes(body.status)) || (body.verification_status && !allowedVerification.includes(body.verification_status))) return NextResponse.json({ error: "Unsupported lead status." }, { status: 400 });
    const rows = await updateSupabase("leads", `id=eq.${encodeURIComponent(body.id)}`, { ...(body.status ? { status: body.status } : {}), ...(body.verification_status ? { verification_status: body.verification_status } : {}) });
    return NextResponse.json({ lead: rows[0] ?? null });
  } catch {
    return NextResponse.json({ error: "Could not update the lead." }, { status: 502 });
  }
}
