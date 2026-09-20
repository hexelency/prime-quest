import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

export const runtime = "nodejs";

export async function GET() {
  if (!isPrismaConfigured()) return NextResponse.json({ database: "preview", counts: {} });
  try {
    const prisma = requirePrisma();
    const [inquiries, mandates, matches, meetings, pendingInquiries, pendingMandates, pendingMatches, pendingMeetings] = await Promise.all([
      prisma.buyerRequest.count(),
      prisma.mandate.count(),
      prisma.buyerRequestMandateMatch.count(),
      prisma.dealMeeting.count(),
      prisma.buyerRequest.count({ where: { status: "new" } }),
      prisma.mandate.count({ where: { status: { in: ["new", "under_review"] } } }),
      prisma.buyerRequestMandateMatch.count({ where: { status: "potential" } }),
      prisma.dealMeeting.count({ where: { status: "pending" } }),
    ]);
    return NextResponse.json({ database: "connected", counts: { inquiries, mandates, matches, meetings, pendingInquiries, pendingMandates, pendingMatches, pendingMeetings } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load overview." }, { status: 500 });
  }
}