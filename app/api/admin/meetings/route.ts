import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import { sendWhatsAppText } from "@/lib/server/whatsapp";

export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const body = await request.json() as { matchId?: string; scheduledAt?: string; timezone?: string };
    if (!body.matchId || !body.scheduledAt || Number.isNaN(Date.parse(body.scheduledAt))) return NextResponse.json({ error: "A match and valid meeting date/time are required." }, { status: 400 });
    const prisma = requirePrisma();
    const match = await prisma.buyerRequestMandateMatch.findUnique({ where: { id: body.matchId } });
    if (!match) return NextResponse.json({ error: "Match was not found." }, { status: 404 });
    const [buyer, seller] = await Promise.all([
      prisma.buyerRequest.findUnique({ where: { id: match.buyerRequestId }, select: { contactName: true, contactPhone: true, contactEmail: true } }),
      prisma.mandate.findUnique({ where: { id: match.sellerMandateId }, select: { product: true, contactName: true, contactPhone: true, contactEmail: true } }),
    ]);
    const inviteToken = randomUUID();
    const baseUrl = process.env.APP_BASE_URL || new URL(request.url).origin;
    const inviteUrl = `${baseUrl}/meeting/${inviteToken}`;
    const meeting = await prisma.dealMeeting.create({ data: { matchId: match.id, scheduledAt: new Date(body.scheduledAt), timezone: body.timezone || "Africa/Lagos", inviteToken } });
    const message = `PrimeQuest meeting invitation\n\nOpportunity match: ${match.id.slice(0, 8).toUpperCase()}\nScheduled: ${new Date(body.scheduledAt).toLocaleString("en-NG", { timeZone: body.timezone || "Africa/Lagos" })}\nDuration: 30 minutes\nJoin: ${inviteUrl}\n\nPrimeQuest will mediate this meeting. Please do not treat this invitation as confirmation of ownership, title or transaction completion.`;
    const delivery = await Promise.all([buyer?.contactPhone ? sendWhatsAppText(buyer.contactPhone, message).catch((error) => ({ sent: false, error: error instanceof Error ? error.message : "Buyer WhatsApp invite failed." })) : Promise.resolve({ sent: false, error: "Buyer has no phone number." }), seller?.contactPhone ? sendWhatsAppText(seller.contactPhone, message).catch((error) => ({ sent: false, error: error instanceof Error ? error.message : "Seller WhatsApp invite failed." })) : Promise.resolve({ sent: false, error: "Seller has no phone number." })]);
    await prisma.adminNotification.create({ data: { kind: "meeting_created", subject: `Meeting invite created for match ${match.id.slice(0, 8).toUpperCase()}`, body: `Invite: ${inviteUrl}\nBuyer delivery: ${JSON.stringify(delivery[0])}\nSeller delivery: ${JSON.stringify(delivery[1])}`, entityId: match.id } });
    return NextResponse.json({ meeting, inviteUrl, buyer: { email: buyer?.contactEmail, delivery: delivery[0] }, seller: { email: seller?.contactEmail, delivery: delivery[1] } }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create meeting invite." }, { status: 500 });
  }
}
