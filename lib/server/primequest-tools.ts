import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

const ignoredQueryWords = new Set([
  "a", "an", "and", "are", "available", "buy", "can", "do", "for", "have", "i", "is", "me", "my", "of", "please", "sale", "show", "the", "there", "to", "want", "what", "with", "you",
]);

function queryMatches(value: string, query: string) {
  const terms = query.toLowerCase().match(/[a-z0-9]+/g)?.filter((term) => term.length > 1 && !ignoredQueryWords.has(term)) ?? [];
  if (!terms.length) return true;
  const normalizedValue = value.toLowerCase();
  return terms.every((term) => normalizedValue.includes(term));
}

export async function searchVerifiedListings(query = "") {
  if (!isPrismaConfigured()) return null;

  try {
    const prisma = requirePrisma();
    const listings = await prisma.assetListing.findMany({
      where: {
        status: "published",
        verificationStatus: { in: ["confirmed", "verified"] },
      },
      orderBy: { publishedAt: "desc" },
      take: 20,
      select: {
        reference: true,
        title: true,
        assetType: true,
        location: true,
        summary: true,
        verificationStatus: true,
      },
    });

    const matches = listings.filter((listing) =>
      queryMatches(`${listing.reference} ${listing.title} ${listing.assetType} ${listing.location ?? ""} ${listing.summary ?? ""}`, query),
    );

    if (!matches.length) return null;

    const summary = matches
      .slice(0, 10)
      .map(
        (listing) =>
          `- ${listing.reference}: ${listing.title} (${listing.assetType})${listing.location ? ` in ${listing.location}` : ""}; verification: ${listing.verificationStatus}`,
      )
      .join("\n");

    return `I found ${matches.length} published and verified marketplace listing${matches.length === 1 ? "" : "s"}:\n\n${summary}`;
  } catch {
    return null;
  }
}

export async function searchSellerMandates(query = "") {
  if (!isPrismaConfigured()) return null;

  try {
    const prisma = requirePrisma();
    const mandates = await prisma.mandate.findMany({
      where: {
        direction: "sell",
        status: { notIn: ["closed", "expired"] },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
      select: {
        product: true,
        assetType: true,
        deliveryLocation: true,
        terms: true,
        status: true,
        verificationStatus: true,
      },
    });

    const matches = mandates.filter((mandate) =>
      queryMatches(`${mandate.product} ${mandate.assetType} ${mandate.deliveryLocation ?? ""} ${mandate.terms ?? ""}`, query),
    );

    if (!matches.length) return null;

    const summary = matches
      .slice(0, 10)
      .map((mandate) => {
        const location = mandate.deliveryLocation ? ` in ${mandate.deliveryLocation}` : "";
        return `- ${mandate.product} (${mandate.assetType})${location}; status: ${mandate.status}; verification: ${mandate.verificationStatus}`;
      })
      .join("\n");

    return `I found ${matches.length} potentially relevant seller mandate${matches.length === 1 ? "" : "s"}. These are database matches, not final commercial or technical verification.\n\n${summary}`;
  } catch {
    return null;
  }
}

export async function answerBuyerSellerQuestion(question: string) {
  const listingReply = await searchVerifiedListings(question);
  if (listingReply) return listingReply;

  if (/mandate|seller|sell|supply|en590|diesel/i.test(question)) {
    const mandateReply = await searchSellerMandates(question);
    if (mandateReply) return mandateReply;
  }

  return null;
}
