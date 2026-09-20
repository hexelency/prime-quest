import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import MandatesWorkspace, { type MandateRecord } from "./MandatesWorkspace";

export const dynamic = "force-dynamic";

type AttachmentRow = { id: string; entityId: string; fileName: string; storagePath: string; mimeType: string; fileSize: number; previewMimeType: string | null; previewFileSize: number | null };

export default async function AdminMandatesPage() {
  let records: MandateRecord[] = [];
  if (isPrismaConfigured()) {
    try {
      const prisma = requirePrisma();
      const [mandates, attachments] = await Promise.all([
        prisma.mandate.findMany({ where: { direction: "sell" }, orderBy: { createdAt: "desc" }, take: 100 }),
        prisma.$queryRawUnsafe<AttachmentRow[]>("SELECT id, entity_id AS \"entityId\", file_name AS \"fileName\", storage_path AS \"storagePath\", mime_type AS \"mimeType\", file_size AS \"fileSize\", preview_mime_type AS \"previewMimeType\", preview_file_size AS \"previewFileSize\" FROM intake_attachments WHERE entity_type = 'mandate'"),
      ]);
      const matches = await prisma.buyerRequestMandateMatch.findMany({ where: { sellerMandateId: { in: mandates.map((mandate) => mandate.id) } }, select: { sellerMandateId: true } });
      const matchCounts = new Map<string, number>();
      for (const match of matches) matchCounts.set(match.sellerMandateId, (matchCounts.get(match.sellerMandateId) ?? 0) + 1);
      records = mandates.map((mandate) => ({
        id: mandate.id,
        product: mandate.product,
        assetType: mandate.assetType,
        location: mandate.deliveryLocation ?? "",
        terms: mandate.terms ?? "",
        imoNumber: mandate.imoNumber ?? "",
        verificationDetails: mandate.verificationDetails ?? "",
        contactName: mandate.contactName ?? "",
        contactEmail: mandate.contactEmail ?? "",
        contactPhone: mandate.contactPhone ?? "",
        status: mandate.status,
        verificationStatus: mandate.verificationStatus,
        source: mandate.source,
        consentVersion: mandate.consentVersion,
        consentAcceptedAt: mandate.consentAcceptedAt.toISOString(),
        contactConsent: mandate.contactConsent,
        meetingConsent: mandate.meetingConsent,
        preferredCallWindows: Array.isArray(mandate.preferredCallWindows) ? mandate.preferredCallWindows.filter((item): item is string => typeof item === "string") : [],
        timezone: mandate.timezone ?? "Africa/Lagos",
        matchCount: matchCounts.get(mandate.id) ?? 0,
        createdAt: mandate.createdAt.toISOString(),
        attachments: attachments.filter((file) => file.entityId === mandate.id).map(({ entityId: _entityId, previewMimeType: _previewMimeType, previewFileSize: _previewFileSize, ...file }) => file),
      }));
    } catch {
      records = [];
    }
  }
  return <MandatesWorkspace initialRecords={records} />;
}
