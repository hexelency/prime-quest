import { requirePrisma } from "@/lib/server/prisma";
import type { AvailableCategory, AvailableListing } from "@/lib/available-listings";
import { getListingMedia } from "@/lib/server/listing-media";

const categoryMap: Record<string, AvailableCategory> = {
  vessel: "vessels",
  property: "property",
  land: "land",
  track_farm: "track-farms",
  energy: "energy",
};

const databaseCategoryMap: Record<AvailableCategory, "vessel" | "property" | "land" | "track_farm" | "energy"> = {
  vessels: "vessel",
  property: "property",
  land: "land",
  "track-farms": "track_farm",
  energy: "energy",
};

export async function getPublishedAvailableListings(category?: AvailableCategory): Promise<AvailableListing[]> {
  const listings = await requirePrisma().assetListing.findMany({
    where: {
      status: "published",
      verificationStatus: { in: ["confirmed", "verified"] },
      ...(category ? { category: databaseCategoryMap[category] } : {}),
    },
    orderBy: { publishedAt: "desc" },
  });
  const mediaByListing = await getListingMedia(listings.map((listing) => listing.id));

  type PublishedListing = {
    id: string;
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

  return (listings as PublishedListing[]).map((listing) => {
    const media = mediaByListing.get(listing.id) ?? [];
    const image = listing.imageUrl ?? "/logo/official-logo.png";
    const listingMedia = media.some((item) => item.url === image) || image === "/logo/official-logo.png"
      ? media
      : [{ type: "image" as const, url: image }, ...media];
    return {
      ref: listing.reference,
      title: listing.title,
      category: categoryMap[listing.category] ?? "energy",
      type: listing.assetType,
      location: listing.location ?? "Information not provided",
      summary: listing.summary ?? "Details supplied after qualification.",
      tags: Array.isArray(listing.tags) ? listing.tags.filter((tag: unknown): tag is string => typeof tag === "string") : [],
      publishedAt: listing.publishedAt?.toISOString() ?? listing.createdAt.toISOString(),
      image,
      ...(listingMedia.length ? { media: listingMedia } : {}),
    };
  });
}