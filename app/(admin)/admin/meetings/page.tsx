import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import MeetingsWorkspace from "./MeetingsWorkspace";

export const dynamic = "force-dynamic";

export default async function AdminMeetingsPage() {
  let meetings: Parameters<typeof MeetingsWorkspace>[0]["initialMeetings"] = [];
  if (isPrismaConfigured()) {
    try {
      const prisma = requirePrisma();
      const rows = await prisma.dealMeeting.findMany({ orderBy: { scheduledAt: "asc" }, take: 200 });
      const matches = await prisma.buyerRequestMandateMatch.findMany({ where: { id: { in: rows.map((row) => row.matchId) } } });
      const [buyers, sellers] = await Promise.all([
        prisma.buyerRequest.findMany({ where: { id: { in: matches.map((match) => match.buyerRequestId) } }, select: { id: true, contactName: true, contactEmail: true, contactPhone: true } }),
        prisma.mandate.findMany({ where: { id: { in: matches.map((match) => match.sellerMandateId) } }, select: { id: true, product: true, contactName: true, contactEmail: true, contactPhone: true } }),
      ]);
      meetings = rows.map((row) => { const match = matches.find((item) => item.id === row.matchId); return { ...row, scheduledAt: row.scheduledAt.toISOString(), buyer: buyers.find((buyer) => buyer.id === match?.buyerRequestId), seller: sellers.find((seller) => seller.id === match?.sellerMandateId) }; }) as never;
    } catch {
      meetings = [];
    }
  }
  return <MeetingsWorkspace initialMeetings={meetings} />;
}
