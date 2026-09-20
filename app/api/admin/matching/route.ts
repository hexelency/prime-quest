import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

export const runtime = "nodejs";

type MatchCandidate = {
  buyerRequestId: string;
  sellerMandateId: string;
  score: number;
  reasons: string[];
};

function words(value: string) {
  return new Set(value.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 2));
}

function scoreMatch(request: { requestText: string; assetType: string | null; location: string | null; budget: string | null }, mandate: { product: string; assetType: string; deliveryLocation: string | null; terms: string | null }) {
  const requestWords = words(`${request.requestText} ${request.assetType ?? ""} ${request.budget ?? ""}`);
  const mandateWords = words(`${mandate.product} ${mandate.assetType} ${mandate.terms ?? ""}`);
  const overlap = [...requestWords].filter((word) => mandateWords.has(word));
  const reasons: string[] = [];
  let score = Math.min(overlap.length * 10, 50);

  if (request.assetType && mandate.assetType.toLowerCase().includes(request.assetType.toLowerCase())) {
    score += 25;
    reasons.push("asset type matches");
  }
  if (request.location && mandate.deliveryLocation && mandate.deliveryLocation.toLowerCase().includes(request.location.toLowerCase())) {
    score += 15;
    reasons.push("location matches");
  }
  if (overlap.length) reasons.push(`shared terms: ${overlap.slice(0, 5).join(", ")}`);
  return { score: Math.min(score, 100), reasons };
}

export async function POST(request: Request) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });

  try {
    const prisma = requirePrisma();
    const body = await request.json().catch(() => ({})) as { scope?: "selected" | "all"; sellerMandateId?: string; buyerRequestId?: string };
    if (body.scope === "selected" && !body.sellerMandateId && !body.buyerRequestId) return NextResponse.json({ error: "sellerMandateId or buyerRequestId is required for a selected scan." }, { status: 400 });
    const [requests, mandates] = await Promise.all([
      prisma.buyerRequest.findMany({ where: { status: { not: "rejected" }, ...(body.scope === "selected" && body.buyerRequestId ? { id: body.buyerRequestId } : {}) }, orderBy: { createdAt: "desc" }, take: 200 }),
      prisma.mandate.findMany({ where: { direction: "sell", status: { notIn: ["closed", "expired"] }, ...(body.scope === "selected" && body.sellerMandateId ? { id: body.sellerMandateId } : {}) }, orderBy: { createdAt: "desc" }, take: 200 }),
    ]);
    const existingMatches = await prisma.buyerRequestMandateMatch.findMany({ where: { buyerRequestId: { in: requests.map((item) => item.id) }, sellerMandateId: { in: mandates.map((item) => item.id) } }, select: { buyerRequestId: true, sellerMandateId: true } });
    const existingPairs = new Set(existingMatches.map((match) => `${match.buyerRequestId}:${match.sellerMandateId}`));

    const candidates: MatchCandidate[] = [];
    for (const request of requests) {
      for (const mandate of mandates) {
        const result = scoreMatch(request, mandate);
        if (result.score < 25) continue;
        candidates.push({ buyerRequestId: request.id, sellerMandateId: mandate.id, score: result.score, reasons: result.reasons });
      }
    }

    let created = 0;
    let skipped = 0;
    for (const candidate of candidates) {
      const pairKey = `${candidate.buyerRequestId}:${candidate.sellerMandateId}`;
      if (existingPairs.has(pairKey)) { skipped += 1; continue; }
      let match;
      try {
        match = await prisma.buyerRequestMandateMatch.create({ data: { buyerRequestId: candidate.buyerRequestId, sellerMandateId: candidate.sellerMandateId, score: candidate.score, reasons: candidate.reasons } });
      } catch (error) {
        if ((error as { code?: string }).code === "P2002") { skipped += 1; continue; }
        throw error;
      }
      existingPairs.add(pairKey);
      const notification = await prisma.adminNotification.findFirst({ where: { kind: "buyer_seller_match", entityId: match.id } });
      if (!notification) {
        const request = requests.find((item) => item.id === candidate.buyerRequestId);
        const mandate = mandates.find((item) => item.id === candidate.sellerMandateId);
        await prisma.adminNotification.create({
          data: {
            kind: "buyer_seller_match",
            subject: `Potential buyer match: ${mandate?.product ?? "seller mandate"}`,
            body: `Buyer request ${request?.id ?? candidate.buyerRequestId} scored ${candidate.score}/100 against seller mandate ${candidate.sellerMandateId}. Reasons: ${candidate.reasons.join("; ") || "shared commercial terms"}. Review before contacting either party.`,
            entityId: match.id,
          },
        });
        created += 1;
      }
    }

    const unmatchedMandates = mandates.filter((mandate) => !candidates.some((candidate) => candidate.sellerMandateId === mandate.id));
    const outreachCandidates = unmatchedMandates.length ? requests.filter((request) => request.contactEmail || request.contactPhone).map((request) => ({ id: request.id, name: request.contactName, email: request.contactEmail, phone: request.contactPhone, requirement: request.requestText })) : [];
    return NextResponse.json({ scope: body.scope ?? "all", scannedRequests: requests.length, scannedMandates: mandates.length, matches: created, skipped, notificationsCreated: created, unmatchedMandates: unmatchedMandates.map((mandate) => ({ id: mandate.id, product: mandate.product, assetType: mandate.assetType })), outreachCandidates, nextActions: unmatchedMandates.length ? ["prepare_previous_buyer_outreach", "run_web_discovery"] : [] });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not scan buyer and seller records." }, { status: 500 });
  }
}

export async function GET() {
  if (!isPrismaConfigured()) return NextResponse.json({ matches: [], database: "preview" });
  try {
    const matches = await requirePrisma().buyerRequestMandateMatch.findMany({
      orderBy: [{ status: "asc" }, { score: "desc" }, { createdAt: "desc" }],
      take: 100,
      include: { buyerRequest: true, sellerMandate: true },
    });
    return NextResponse.json({ matches, database: "connected" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load matches." }, { status: 500 });
  }
}
