import { randomUUID } from "node:crypto";
import sharp from "sharp";
import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import { buildIntakeAcknowledgement, sendWhatsAppText } from "@/lib/server/whatsapp";

export const runtime = "nodejs";

const CONSENT_VERSION = "2026-09-18-v1";
const adminWhatsApp = process.env.ADMIN_WHATSAPP_NUMBER ?? "2348108117215";

function text(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function callWindows(value: unknown) {
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === "string").slice(0, 8);
  if (typeof value !== "string") return [];
  try { return callWindows(JSON.parse(value)); } catch { return value ? [value.slice(0, 120)] : []; }
}

async function saveAttachment(prisma: ReturnType<typeof requirePrisma>, entityId: string, attachment: { fileName: string; storagePath: string; mimeType: string; fileSize: number; content: Buffer; previewContent: Buffer | null; previewMimeType: string | null; previewFileSize: number | null }) {
  await prisma.$executeRawUnsafe(
    "INSERT INTO intake_attachments (entity_type, entity_id, file_name, storage_path, mime_type, file_size, content, preview_content, preview_mime_type, preview_file_size) VALUES ($1, $2::uuid, $3, $4, $5, $6, $7, $8, $9, $10)",
    "mandate", entityId, attachment.fileName, attachment.storagePath, attachment.mimeType, attachment.fileSize, attachment.content, attachment.previewContent, attachment.previewMimeType, attachment.previewFileSize,
  );
}

async function uploadAttachment(file: File, entityId: string, entityType: string) {
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "-").slice(-120);
  const filename = `${randomUUID()}-${safeName}`;
  const content = Buffer.from(await file.arrayBuffer());
  const isImage = file.type.startsWith("image/");
  const previewContent = isImage ? await sharp(content).rotate().resize({ width: 640, height: 480, fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toBuffer() : null;
  return { fileName: file.name, storagePath: `database://intake-attachments/${entityType}/${entityId}/${filename}`, mimeType: file.type || "application/octet-stream", fileSize: file.size, content, previewContent, previewMimeType: previewContent ? "image/webp" : null, previewFileSize: previewContent?.length ?? null };
}

export async function POST(request: Request) {
  try {
    const formData = request.headers.get("content-type")?.includes("multipart/form-data") ? await request.formData() : null;
    const body = formData ? { ...Object.fromEntries(Array.from(formData.entries()).filter(([, value]) => typeof value === "string")), call_windows: formData.getAll("call_windows") } : await request.json() as Record<string, unknown>;
    const kind = text(body.kind, 20);
    const name = text(body.name, 180);
    const email = text(body.email, 180);
    const phone = text(body.phone, 80);
    const location = text(body.location, 180);
    const description = text(body.description, 2000);
    const terms = text(body.terms, 500);
    const category = text(body.category, 40).toLowerCase();
    const consent = body.consent === true || body.consent === "on" || body.consent === "true";
    const contactConsent = body.contact_consent === true || body.contact_consent === "on" || body.contact_consent === "true";
    const meetingConsent = body.meeting_consent === true || body.meeting_consent === "on" || body.meeting_consent === "true";
    const preferredCallWindows = callWindows(body.call_windows);
    const timezone = text(body.timezone, 80) || "Africa/Lagos";

    if (!isPrismaConfigured()) return NextResponse.json({ error: "The intake service is not configured." }, { status: 503 });
    if (!["buyer", "seller"].includes(kind)) return NextResponse.json({ error: "Choose whether this is a buyer request or seller mandate." }, { status: 400 });
    if (!name || !email || !phone || !description || !consent || !contactConsent || !meetingConsent || !preferredCallWindows.length) return NextResponse.json({ error: "Name, email, phone, request details, contact consent, meeting consent and at least one preferred time window are required." }, { status: 400 });

    const prisma = requirePrisma();
    const consentAcceptedAt = new Date();
    const source = text(body.source, 40) || "public_form";
    const subject = `${kind === "buyer" ? "Buyer request" : "Seller mandate"}: ${description.slice(0, 100)}`;
    const files = formData ? Array.from(formData.values()).filter((value): value is File => value instanceof File && value.size > 0) : [];
    if (kind === "seller" && files.length > 10) return NextResponse.json({ error: "You can upload up to 10 files." }, { status: 400 });
    if (kind === "seller") {
      const oversized = files.find((file) => file.size > 10 * 1024 * 1024);
      if (oversized) return NextResponse.json({ error: `${oversized.name} is larger than 10 MB.` }, { status: 400 });
    }
    let entityId: string;

    if (kind === "buyer") {
      const record = await prisma.buyerRequest.create({ data: {
        requestText: description, category: ["vessel", "property", "land", "track_farm", "energy"].includes(category as never) ? category as never : undefined,
        assetType: text(body.asset_type, 180) || undefined, location: location || undefined, budget: terms || undefined,
        contactName: name, contactEmail: email, contactPhone: phone, source, consentVersion: CONSENT_VERSION, consentAcceptedAt, contactConsent, meetingConsent, preferredCallWindows, timezone,
      } });
      entityId = record.id;
    } else {
      const record = await prisma.mandate.create({ data: {
        direction: "sell", assetType: text(body.asset_type, 180) || category || "unspecified", product: description,
        deliveryLocation: location || undefined, terms: terms || undefined, contactName: name, contactEmail: email, contactPhone: phone,
        source, consentVersion: CONSENT_VERSION, consentAcceptedAt, contactConsent, meetingConsent, preferredCallWindows, timezone,
      } });
      entityId = record.id;
      for (const file of files) {
        try {
          const attachment = await uploadAttachment(file, entityId, "mandate");
          await saveAttachment(prisma, entityId, attachment);
        } catch (error) {
          await prisma.$executeRawUnsafe("DELETE FROM intake_attachments WHERE entity_type = $1 AND entity_id = $2::uuid", "mandate", entityId).catch(() => undefined);
          await prisma.mandate.delete({ where: { id: entityId } }).catch(() => undefined);
          throw error;
        }
      }
    }

    const notification = await prisma.adminNotification.create({ data: { kind, subject, body: `${name} · ${email} · ${phone}\n${description}`, entityId } });
    const adminMessage = `New PrimeQuest ${kind} intake (${notification.id})\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\nDetails: ${description}`;
    let whatsapp = { configured: false, sent: false } as { configured: boolean; sent: boolean; messageId?: string; error?: string };
    try {
      whatsapp = await sendWhatsAppText(phone, buildIntakeAcknowledgement(kind as "buyer" | "seller"));
    } catch (whatsappError) {
      console.error("WhatsApp intake acknowledgement failed:", whatsappError);
      whatsapp = { configured: true, sent: false, error: whatsappError instanceof Error ? whatsappError.message : "WhatsApp acknowledgement failed." };
    }
    return NextResponse.json({ id: entityId, notification_id: notification.id, admin_whatsapp_url: `https://wa.me/${adminWhatsApp}?text=${encodeURIComponent(adminMessage)}`, whatsapp, message: "Your request has been received and is queued for PrimeQuest review." }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not submit the request." }, { status: 500 });
  }
}