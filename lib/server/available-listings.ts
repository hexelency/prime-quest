import { requirePrisma } from "@/lib/server/prisma";
import type { AvailableCategory, AvailableListing } from "@/lib/available-listings";

const categoryMap: Record<string, AvailableCategory> = {
  vessel: "vessels",
  property: "property",
  land: "land",
  track_farm: "track-farms",
  energy: "energy",
};

export async function getPublishedAvailableListings(): Promise<AvailableListing[]> {
  const listings = await requirePrisma().assetListing.findMany({
    where: { status: "published", verificationStatus: { in: ["confirmed", "verified"] } },
    orderBy: { publishedAt: "desc" },
  });

  type PublishedListing = {
    reference: string;
    title: string;
    category: string;
    assetType: string;
    location: string | null;
    summary: string | null;
    imageUrl: string | null;
    tags: unknown;
    publishedAt: Date | null;
    createdAt: Date;
  };

  return (listings as PublishedListing[]).map((listing) => ({
    ref: listing.reference,
    title: listing.title,
    category: categoryMap[listing.category] ?? "energy",
    type: listing.assetType,
    location: listing.location ?? "Information not provided",
    summary: listing.summary ?? "Details supplied after qualification.",
    tags: Array.isArray(listing.tags) ? listing.tags.filter((tag: unknown): tag is string => typeof tag === "string") : [],
    publishedAt: listing.publishedAt?.toISOString() ?? listing.createdAt.toISOString(),
    image: listing.imageUrl ?? "/listing-placeholder.svg",
  }));
}