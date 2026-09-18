import { NextResponse } from "next/server";
import { demoMarketBuyers } from "@/lib/demo-market-intelligence";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

export function serializeLead(lead: Record<string, unknown>) {
  return {
    id: lead.id,
    company_name: lead.companyName,
    kind: lead.kind,
    country: lead.country,
    website: lead.website,
    source_url: lead.sourceUrl,
    source_summary: lead.sourceSummary,
    confidence_score: lead.confidenceScore,
    status: lead.status,
    verification_status: lead.verificationStatus,
    risk_flags: lead.riskFlags,
    last_researched_at: lead.lastResearchedAt,
    created_at: lead.createdAt,
  };
}

export async function GET() {
  if (!isPrismaConfigured()) return NextResponse.json({ leads: demoMarketBuyers, database: "preview" });
  try {
    const leads = await requirePrisma().lead.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ leads: leads.map((lead: Record<string, unknown>) => serializeLead(lead)), database: "connected" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load leads." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const body = await request.json() as { id?: string; status?: string; verification_status?: string };
    if (!body.id || (!body.status && !body.verification_status)) return NextResponse.json({ error: "A lead id and update are required." }, { status: 400 });
    const lead = await requirePrisma().lead.update({
      where: { id: body.id },
      data: {
        ...(body.status ? { status: body.status as "discovered" | "researched" | "contacted" | "interested" | "registered" | "rejected" } : {}),
        ...(body.verification_status ? { verificationStatus: body.verification_status as "potential" | "confirmed" | "under_review" | "verified" | "rejected" } : {}),
      },
    });
    return NextResponse.json({ lead: serializeLead(lead as unknown as Record<string, unknown>) });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update lead." }, { status: 500 });
  }
}