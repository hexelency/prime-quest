import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import MatchesWorkspace from "./MatchesWorkspace";

export const dynamic = "force-dynamic";

export default async function AdminMatchesPage({ searchParams }: { searchParams?: Promise<{ buyerRequestId?: string; sellerMandateId?: string }> }) {
  let matches: Parameters<typeof MatchesWorkspace>[0]["initialMatches"] = [];
  if (isPrismaConfigured()) {
    try {
      const prisma = requirePrisma();
      const params = await searchParams;
      const rows = await prisma.buyerRequestMandateMatch.findMany({ where: params?.buyerRequestId ? { buyerRequestId: params.buyerRequestId } : params?.sellerMandateId ? { sellerMandateId: params.sellerMandateId } : undefined, orderBy: [{ status: "asc" }, { score: "desc" }, { createdAt: "desc" }], take: 100 });
      const [buyers, sellers, meetings] = await Promise.all([
        prisma.buyerRequest.findMany({ where: { id: { in: rows.map((row) => row.buyerRequestId) } }, select: { id: true, requestText: true, contactName: true, contactEmail: true, contactPhone: true, timezone: true, preferredCallWindows: true, meetingConsent: true, contactConsent: true } }),
        prisma.mandate.findMany({ where: { id: { in: rows.map((row) => row.sellerMandateId) } }, select: { id: true, product: true, assetType: true, contactName: true, contactEmail: true, contactPhone: true, timezone: true, preferredCallWindows: true, meetingConsent: true, contactConsent: true } }),
        prisma.dealMeeting.findMany({ where: { matchId: { in: rows.map((row) => row.id) } }, select: { id: true, matchId: true, status: true } }),
      ]);
      matches = rows.map((row) => ({ ...row, score: Number(row.score), createdAt: row.createdAt.toISOString(), buyerRequest: buyers.find((buyer) => buyer.id === row.buyerRequestId), sellerMandate: sellers.find((seller) => seller.id === row.sellerMandateId), meeting: meetings.find((meeting) => meeting.matchId === row.id) })) as never;
    } catch {
      matches = [];
    }
  }
  return <MatchesWorkspace initialMatches={matches} />;
}
