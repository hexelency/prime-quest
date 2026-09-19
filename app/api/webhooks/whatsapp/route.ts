import { createHmac, timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { buildPrimeQuestReply } from "@/lib/primequest-chatbot";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import { sendWhatsAppText } from "@/lib/server/whatsapp";

export const runtime = "nodejs";

function validSignature(rawBody: string, signature: string | null) {
  const appSecret = process.env.WHATSAPP_APP_SECRET?.trim();
  if (!appSecret) return process.env.NODE_ENV !== "production";
  if (!signature?.startsWith("sha256=")) return false;
  const expected = createHmac("sha256", appSecret).update(rawBody).digest("hex");
  const actual = signature.slice(7);
  return actual.length === expected.length && timingSafeEqual(Buffer.from(actual), Buffer.from(expected));
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN?.trim();
  if (!verifyToken || url.searchParams.get("hub.verify_token") !== verifyToken) return new NextResponse("Forbidden", { status: 403 });
  return new NextResponse(url.searchParams.get("hub.challenge") ?? "", { status: 200 });
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  if (!validSignature(rawBody, request.headers.get("x-hub-signature-256"))) return NextResponse.json({ error: "Invalid webhook signature." }, { status: 403 });

  try {
    const payload = JSON.parse(rawBody) as { entry?: Array<{ changes?: Array<{ value?: { messages?: Array<{ from?: string; id?: string; type?: string; text?: { body?: string } }> ; statuses?: Array<{ id?: string; status?: string; recipient_id?: string }> } }> }> };
    const values = payload.entry?.flatMap((entry) => entry.changes ?? []).map((change) => change.value).filter(Boolean) ?? [];
    const incoming = values.flatMap((value) => value?.messages ?? []).filter((message) => message.from && message.text?.body);
    const statuses = values.flatMap((value) => value?.statuses ?? []).filter((status) => status.status);

    if (isPrismaConfigured()) {
      const prisma = requirePrisma();
      for (const message of incoming) {
        await prisma.adminNotification.create({ data: { kind: "whatsapp_incoming", subject: `WhatsApp message from ${message.from}`, body: message.text?.body ?? "", entityId: null } });
      }
      for (const status of statuses) {
        await prisma.adminNotification.create({ data: { kind: "whatsapp_status", subject: `WhatsApp message ${status.status}`, body: `${status.id ?? "unknown"} → ${status.recipient_id ?? "unknown"}`, entityId: null } });
      }
    }

    if (process.env.WHATSAPP_AUTO_REPLY === "true") {
      for (const message of incoming) {
        const reply = buildPrimeQuestReply(message.text?.body ?? "");
        await sendWhatsAppText(message.from ?? "", reply);
      }
    }

    return NextResponse.json({ received: true, messages: incoming.length, statuses: statuses.length });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not process WhatsApp webhook." }, { status: 400 });
  }
}
