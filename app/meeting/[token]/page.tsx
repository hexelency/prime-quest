import { notFound } from "next/navigation";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

export const dynamic = "force-dynamic";

type PageProps = { params: Promise<{ token: string }> };

export default async function MeetingInvitePage({ params }: PageProps) {
  const { token } = await params;
  if (!isPrismaConfigured()) notFound();
  const meeting = await requirePrisma().dealMeeting.findUnique({ where: { inviteToken: token } });
  if (!meeting) notFound();
  const prisma = requirePrisma();
  const match = await prisma.buyerRequestMandateMatch.findUnique({ where: { id: meeting.matchId } });
  if (!match) notFound();
  const [buyer, seller] = await Promise.all([
    prisma.buyerRequest.findUnique({ where: { id: match.buyerRequestId }, select: { contactName: true, requestText: true } }),
    prisma.mandate.findUnique({ where: { id: match.sellerMandateId }, select: { product: true, assetType: true } }),
  ]);
  return <main style={{ background: "#eef2ee", color: "#17231f", minHeight: "100vh", padding: "70px 20px" }}><section style={{ background: "#fff", border: "1px solid #dfe5df", margin: "0 auto", maxWidth: 720, padding: "clamp(24px, 6vw, 58px)" }}><p style={{ color: "#d66d3f", fontSize: 10, letterSpacing: ".16em", textTransform: "uppercase" }}>PrimeQuest Deal Room</p><h1 style={{ font: "400 clamp(40px, 7vw, 70px)/.95 Georgia, serif", margin: "12px 0 20px" }}>Secure meeting invite</h1><p style={{ color: "#718079", lineHeight: 1.7 }}>This is an admin-mediated introduction. PrimeQuest facilitates communication; all ownership, technical, legal and commercial facts remain subject to due diligence.</p><div style={{ borderTop: "1px solid #dfe5df", display: "grid", gap: 16, marginTop: 30, paddingTop: 24 }}><div><small style={{ color: "#718079", display: "block", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" }}>Opportunity</small><strong>{seller?.product || "PrimeQuest opportunity"}</strong><span style={{ color: "#718079", display: "block", fontSize: 12 }}>{seller?.assetType || "Commercial asset"}</span></div><div><small style={{ color: "#718079", display: "block", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" }}>Scheduled</small><strong>{meeting.scheduledAt.toLocaleString("en-NG", { timeZone: meeting.timezone })}</strong><span style={{ color: "#718079", display: "block", fontSize: 12 }}>{meeting.timezone} · {meeting.durationMinutes} minutes</span></div><div><small style={{ color: "#718079", display: "block", fontSize: 10, letterSpacing: ".1em", textTransform: "uppercase" }}>Participants</small><span style={{ display: "block" }}>Buyer: {buyer?.contactName || "Buyer participant"}</span><span style={{ display: "block" }}>Seller / mandate: {seller?.product || "Seller participant"}</span></div></div><div style={{ background: "#17352f", color: "#f8f4ec", marginTop: 30, padding: 22 }}><strong style={{ display: "block", font: "22px Georgia, serif" }}>Meeting access</strong><p style={{ color: "rgba(248,244,236,.7)", fontSize: 12, lineHeight: 1.6 }}>The secure call room will be opened by PrimeQuest at the scheduled time. Keep this link available and join only after accepting the applicable meeting terms.</p><button type="button" disabled style={{ background: "#d66d3f", border: 0, color: "#fff", cursor: "not-allowed", fontSize: 11, padding: "13px 16px", textTransform: "uppercase" }}>Call room opens at appointment</button></div></section></main>;
}
