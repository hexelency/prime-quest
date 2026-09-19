import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import MatchesWorkspace from "./MatchesWorkspace";

export const dynamic = "force-dynamic";

export default async function AdminMatchesPage() {
  let matches: Parameters<typeof MatchesWorkspace>[0]["initialMatches"] = [];
  if (isPrismaConfigured()) {
    try {
      const prisma = requirePrisma();
      const rows = await prisma.buyerRequestMandateMatch.findMany({ orderBy: [{ status: "asc" }, { score: "desc" }, { createdAt: "desc" }], take: 100 });
      const [buyers, sellers] = await Promise.all([
        prisma.buyerRequest.findMany({ where: { id: { in: rows.map((row) => row.buyerRequestId) } }, select: { id: true, requestText: true, contactName: true, contactEmail: true, contactPhone: true, timezone: true, preferredCallWindows: true, meetingConsent: true, contactConsent: true } }),
        prisma.mandate.findMany({ where: { id: { in: rows.map((row) => row.sellerMandateId) } }, select: { id: true, product: true, assetType: true, contactName: true, contactEmail: true, contactPhone: true, timezone: true, preferredCallWindows: true, meetingConsent: true, contactConsent: true } }),
      ]);
      matches = rows.map((row) => ({ ...row, score: Number(row.score), createdAt: row.createdAt.toISOString(), buyerRequest: buyers.find((buyer) => buyer.id === row.buyerRequestId), sellerMandate: sellers.find((seller) => seller.id === row.sellerMandateId) })) as never;
    } catch {
      matches = [];
    }
  }
  return <MatchesWorkspace initialMatches={matches} />;
}
