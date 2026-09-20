import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import { sendWhatsAppText } from "@/lib/server/whatsapp";

export const runtime = "nodejs";

function nextWeekday() {
  const date = new Date();
  date.setDate(date.getDate() + (date.getDay() === 5 ? 3 : date.getDay() === 6 ? 2 : 1));
  date.setHours(14, 0, 0, 0);
  return date;
}

function suggestedTime(preferredWindows: unknown, fallback: Date) {
  if (!Array.isArray(preferredWindows)) return null;
  const window = preferredWindows.find((item): item is string => typeof item === "string");
  const start = window?.match(/\(([^-]+)/)?.[1]?.trim();
  if (!start) return null;
  const [hours, minutes = 0] = start.split(":").map(Number);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  const result = new Date(fallback);
  result.setHours(hours, minutes, 0, 0);
  return result;
}

export async function POST(request: Request) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const body = await request.json() as { matchId?: string; scheduledAt?: string; timezone?: string; createAll?: boolean };
    const prisma = requirePrisma();
    if (body.createAll) {
      const [matches, existing] = await Promise.all([
        prisma.buyerRequestMandateMatch.findMany({ include: { buyerRequest: { select: { preferredCallWindows: true, timezone: true } }, sellerMandate: { select: { preferredCallWindows: true, timezone: true } } } }),
        prisma.dealMeeting.findMany({ select: { matchId: true } }),
      ]);
      const existingIds = new Set(existing.map((meeting) => meeting.matchId));
      const fallback = nextWeekday();
      const created = [];
      for (const match of matches) {
        if (existingIds.has(match.id)) continue;
        const buyerTime = suggestedTime(match.buyerRequest.preferredCallWindows, fallback);
        const sellerTime = suggestedTime(match.sellerMandate.preferredCallWindows, fallback);
        const scheduledAt = buyerTime || sellerTime || fallback;
        created.push(await prisma.dealMeeting.create({ data: { matchId: match.id, scheduledAt, timezone: match.buyerRequest.timezone || match.sellerMandate.timezone || "Africa/Lagos", inviteToken: randomUUID() } }));
      }
      return NextResponse.json({ created: created.length, skipped: existing.length, meetings: created }, { status: 201 });
    }
    if (!body.matchId || !body.scheduledAt || Number.isNaN(Date.parse(body.scheduledAt))) return NextResponse.json({ error: "A match and valid meeting date/time are required." }, { status: 400 });
    const match = await prisma.buyerRequestMandateMatch.findUnique({ where: { id: body.matchId } });
    if (!match) return NextResponse.json({ error: "Match was not found." }, { status: 404 });
    const existing = await prisma.dealMeeting.findFirst({ where: { matchId: match.id } });
    if (existing) return NextResponse.json({ error: `This match already has a ${existing.status} meeting.`, meeting: existing }, { status: 409 });
    const inviteToken = randomUUID();
    const meeting = await prisma.dealMeeting.create({ data: { matchId: match.id, scheduledAt: new Date(body.scheduledAt), timezone: body.timezone || "Africa/Lagos", inviteToken } });
    return NextResponse.json({ meeting }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not create meeting invite." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const body = await request.json() as { meetingId?: string; status?: string };
    if (!body.meetingId) return NextResponse.json({ error: "A meeting is required." }, { status: 400 });
    const prisma = requirePrisma();
    const meeting = await prisma.dealMeeting.findUnique({ where: { id: body.meetingId }, include: { match: true } });
    if (!meeting) return NextResponse.json({ error: "Meeting was not found." }, { status: 404 });
    if (body.status) {
      if (body.status !== "past") return NextResponse.json({ error: "Only the past status can be set by this action." }, { status: 400 });
      if (meeting.status === "past") return NextResponse.json({ meeting });
      const updated = await prisma.dealMeeting.update({ where: { id: meeting.id }, data: { status: "past" } });
      return NextResponse.json({ meeting: updated });
    }
    const [buyer, seller] = await Promise.all([
      prisma.buyerRequest.findUnique({ where: { id: meeting.match.buyerRequestId }, select: { contactPhone: true } }),
      prisma.mandate.findUnique({ where: { id: meeting.match.sellerMandateId }, select: { contactPhone: true } }),
    ]);
    const inviteUrl = `${process.env.APP_BASE_URL || new URL(request.url).origin}/meeting/${meeting.inviteToken}`;
    const message = `PrimeQuest meeting invitation\n\nScheduled: ${meeting.scheduledAt.toLocaleString("en-NG", { timeZone: meeting.timezone })}\nDuration: ${meeting.durationMinutes} minutes\nJoin: ${inviteUrl}`;
    const delivery = await Promise.all([buyer?.contactPhone ? sendWhatsAppText(buyer.contactPhone, message).catch((error) => ({ sent: false, error: error instanceof Error ? error.message : "Buyer WhatsApp delivery failed." })) : Promise.resolve({ sent: false, error: "Buyer has no phone number." }), seller?.contactPhone ? sendWhatsAppText(seller.contactPhone, message).catch((error) => ({ sent: false, error: error instanceof Error ? error.message : "Seller WhatsApp delivery failed." })) : Promise.resolve({ sent: false, error: "Seller has no phone number." })]);
    const sent = delivery.some((item) => item.sent);
    const updated = await prisma.dealMeeting.update({ where: { id: meeting.id }, data: { status: sent ? "sent" : "pending" } });
    await prisma.adminNotification.create({ data: { kind: "meeting_invite_sent", subject: `Meeting link sent for ${meeting.matchId.slice(0, 8).toUpperCase()}`, body: JSON.stringify(delivery), entityId: meeting.matchId } });
    return NextResponse.json({ meeting: updated, delivery });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not send meeting link." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const body = await request.json() as { meetingId?: string };
    if (!body.meetingId) return NextResponse.json({ error: "A meeting is required." }, { status: 400 });
    const prisma = requirePrisma();
    await prisma.dealMeeting.delete({ where: { id: body.meetingId } });
    return NextResponse.json({ deleted: true, meetingId: body.meetingId });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete meeting." }, { status: 500 });
  }
}
