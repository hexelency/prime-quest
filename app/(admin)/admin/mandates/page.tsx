import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import MandatesWorkspace, { type MandateRecord } from "./MandatesWorkspace";

export const dynamic = "force-dynamic";

type AttachmentRow = { id: string; entityId: string; fileName: string; storagePath: string; mimeType: string; fileSize: number };

export default async function AdminMandatesPage() {
  let records: MandateRecord[] = [];
  if (isPrismaConfigured()) {
    try {
      const prisma = requirePrisma();
      const [mandates, attachments] = await Promise.all([
        prisma.mandate.findMany({ where: { direction: "sell" }, orderBy: { createdAt: "desc" }, take: 100 }),
        prisma.$queryRawUnsafe<AttachmentRow[]>("SELECT id, entity_id AS \"entityId\", file_name AS \"fileName\", storage_path AS \"storagePath\", mime_type AS \"mimeType\", file_size AS \"fileSize\" FROM intake_attachments WHERE entity_type = 'mandate'"),
      ]);
      records = mandates.map((mandate) => ({
        id: mandate.id,
        product: mandate.product,
        assetType: mandate.assetType,
        location: mandate.deliveryLocation ?? "",
        terms: mandate.terms ?? "",
        contactName: mandate.contactName ?? "",
        contactEmail: mandate.contactEmail ?? "",
        contactPhone: mandate.contactPhone ?? "",
        status: mandate.status,
        verificationStatus: mandate.verificationStatus,
        source: mandate.source,
        consentVersion: mandate.consentVersion,
        consentAcceptedAt: mandate.consentAcceptedAt.toISOString(),
        createdAt: mandate.createdAt.toISOString(),
        attachments: attachments.filter((file) => file.entityId === mandate.id).map(({ entityId: _entityId, ...file }) => file),
      }));
    } catch {
      records = [];
    }
  }
  return <MandatesWorkspace initialRecords={records} />;
}
