import AdminRecordsPage from "@/app/(admin)/components/AdminRecordsPage";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

export default async function AdminInquiriesPage() {
  let liveRecords: Array<{ ref: string; title: string; detail: string; status: string; date: string }> = [];
  if (isPrismaConfigured()) {
    try {
      const requests = await requirePrisma().buyerRequest.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
      liveRecords = requests.map((request) => ({
        ref: request.id.slice(0, 8).toUpperCase(),
        title: request.requestText.slice(0, 100),
        detail: `Buyer inquiry · ${request.assetType ?? "Requirement pending"} · ${request.location ?? "Location pending"} · ${request.contactName ?? "Contact pending"}`,
        status: request.status,
        date: request.createdAt.toISOString().slice(0, 10),
      }));
    } catch { liveRecords = []; }
  }
  return <AdminRecordsPage eyebrow="Relationship desk" title="Inquiries" description="Track buyer interest, seller questions and the next human action required for each conversation." records={liveRecords} />;
}
