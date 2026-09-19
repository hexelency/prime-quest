import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

export const runtime = "nodejs";

export async function GET() {
  if (!isPrismaConfigured()) return NextResponse.json({ meetings: [], database: "preview" });
  try {
    const prisma = requirePrisma();
    const meetings = await prisma.dealMeeting.findMany({ orderBy: { scheduledAt: "asc" }, take: 100 });
    const matches = await prisma.buyerRequestMandateMatch.findMany({ where: { id: { in: meetings.map((meeting) => meeting.matchId) } } });
    const [buyers, sellers] = await Promise.all([
      prisma.buyerRequest.findMany({ where: { id: { in: matches.map((match) => match.buyerRequestId) } }, select: { id: true, contactName: true, contactEmail: true, contactPhone: true, requestText: true } }),
      prisma.mandate.findMany({ where: { id: { in: matches.map((match) => match.sellerMandateId) } }, select: { id: true, product: true, contactName: true, contactEmail: true, contactPhone: true } }),
    ]);
    return NextResponse.json({ meetings: meetings.map((meeting) => { const match = matches.find((item) => item.id === meeting.matchId); return { ...meeting, scheduledAt: meeting.scheduledAt.toISOString(), match, buyer: buyers.find((item) => item.id === match?.buyerRequestId), seller: sellers.find((item) => item.id === match?.sellerMandateId) }; }), database: "connected" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load meetings." }, { status: 500 });
  }
}
