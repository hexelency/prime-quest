import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import ClosedDealsWorkspace from "./ClosedDealsWorkspace";

export const dynamic = "force-dynamic";

export default async function ClosedDealsPage() {
  let deals: Parameters<typeof ClosedDealsWorkspace>[0]["initialDeals"] = [];
  if (isPrismaConfigured()) {
    try {
      const rows = await requirePrisma().buyerRequestMandateMatch.findMany({ where: { status: "closed" }, orderBy: { reviewedAt: "desc" }, include: { buyerRequest: { select: { contactName: true, contactEmail: true, requestText: true } }, sellerMandate: { select: { product: true, contactName: true, contactEmail: true } }, meetings: { select: { id: true, status: true, scheduledAt: true } } } });
      deals = rows.map((row) => ({ id: row.id, score: row.score, reviewedAt: row.reviewedAt?.toISOString() ?? row.createdAt.toISOString(), buyer: row.buyerRequest, seller: row.sellerMandate, meetings: row.meetings.map((meeting) => ({ ...meeting, scheduledAt: meeting.scheduledAt.toISOString() })) }));
    } catch { deals = []; }
  }
  return <ClosedDealsWorkspace initialDeals={deals} />;
}
