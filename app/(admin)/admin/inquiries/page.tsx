import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import InquiriesWorkspace, { type InquiryRecord } from "./InquiriesWorkspace";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  let records: InquiryRecord[] = [];
  if (isPrismaConfigured()) {
    try {
      const requests = await requirePrisma().buyerRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
      records = requests.map((request) => ({ id: request.id, requestText: request.requestText, category: request.category ?? "", assetType: request.assetType ?? "", location: request.location ?? "", budget: request.budget ?? "", contactName: request.contactName ?? "", contactEmail: request.contactEmail ?? "", contactPhone: request.contactPhone ?? "", status: request.status, source: request.source, consentVersion: request.consentVersion, consentAcceptedAt: request.consentAcceptedAt.toISOString(), createdAt: request.createdAt.toISOString() }));
    } catch { records = []; }
  }
  return <InquiriesWorkspace initialRecords={records} />;
}
