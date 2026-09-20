import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import InquiriesWorkspace, { type InquiryRecord } from "./InquiriesWorkspace";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  let records: InquiryRecord[] = [];
  if (isPrismaConfigured()) {
    try {
      const prisma = requirePrisma();
      const requests = await prisma.buyerRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
      const matches = await prisma.buyerRequestMandateMatch.findMany({ where: { buyerRequestId: { in: requests.map((request) => request.id) } }, select: { buyerRequestId: true } });
      const matchCounts = new Map<string, number>();
      for (const match of matches) matchCounts.set(match.buyerRequestId, (matchCounts.get(match.buyerRequestId) ?? 0) + 1);
      records = requests.map((request) => ({ id: request.id, requestText: request.requestText, category: request.category ?? "", assetType: request.assetType ?? "", location: request.location ?? "", budget: request.budget ?? "", imoNumber: request.imoNumber ?? "", verificationDetails: request.verificationDetails ?? "", contactName: request.contactName ?? "", contactEmail: request.contactEmail ?? "", contactPhone: request.contactPhone ?? "", status: request.status, source: request.source, consentVersion: request.consentVersion, consentAcceptedAt: request.consentAcceptedAt.toISOString(), contactConsent: request.contactConsent, meetingConsent: request.meetingConsent, preferredCallWindows: Array.isArray(request.preferredCallWindows) ? request.preferredCallWindows.filter((item): item is string => typeof item === "string") : [], timezone: request.timezone ?? "Africa/Lagos", matchCount: matchCounts.get(request.id) ?? 0, createdAt: request.createdAt.toISOString() }));
    } catch { records = []; }
  }
  return <InquiriesWorkspace initialRecords={records} />;
}
