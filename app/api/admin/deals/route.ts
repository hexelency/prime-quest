import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

export const runtime = "nodejs";

export async function GET() {
  if (!isPrismaConfigured()) return NextResponse.json({ deals: [], database: "preview" });
  try {
    const prisma = requirePrisma();
    const deals = await prisma.buyerRequestMandateMatch.findMany({ where: { status: "closed" }, orderBy: { reviewedAt: "desc" }, include: { buyerRequest: { select: { contactName: true, contactEmail: true, requestText: true } }, sellerMandate: { select: { product: true, contactName: true, contactEmail: true } }, meetings: { select: { id: true, status: true, scheduledAt: true } } } });
    return NextResponse.json({ deals, database: "connected" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load closed deals." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const body = await request.json() as { matchId?: string; status?: string };
    if (!body.matchId || !body.status) return NextResponse.json({ error: "matchId and status are required." }, { status: 400 });
    if (!["closed", "potential"].includes(body.status)) return NextResponse.json({ error: "Unsupported deal status." }, { status: 400 });
    const deal = await requirePrisma().buyerRequestMandateMatch.update({ where: { id: body.matchId }, data: { status: body.status, reviewedAt: new Date() } });
    return NextResponse.json({ deal });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update deal." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const body = await request.json() as { matchId?: string };
    if (!body.matchId) return NextResponse.json({ error: "matchId is required." }, { status: 400 });
    await requirePrisma().buyerRequestMandateMatch.delete({ where: { id: body.matchId } });
    return NextResponse.json({ deleted: true, cascaded: "meetings" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete closed deal." }, { status: 500 });
  }
}
