import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma";
import { availableListings } from "../lib/available-listings";

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) throw new Error("DIRECT_URL or DATABASE_URL is required to seed the database.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const categoryMap = {
  vessels: "vessel",
  property: "property",
  land: "land",
  "track-farms": "track_farm",
  energy: "energy",
} as const;

async function main() {
  for (const listing of availableListings) {
    await prisma.assetListing.upsert({
      where: { reference: listing.ref },
      create: {
        reference: listing.ref,
        title: listing.title,
        category: categoryMap[listing.category],
        assetType: listing.type,
        location: listing.location,
        summary: listing.summary,
        imageUrl: listing.image,
        tags: [...listing.tags],
        discoveredBy: "seed_demo_inventory",
        confidenceScore: 100,
        status: "published",
        verificationStatus: "verified",
        publishedAt: new Date(listing.publishedAt),
      },
      update: {
        title: listing.title,
        category: categoryMap[listing.category],
        assetType: listing.type,
        location: listing.location,
        summary: listing.summary,
        imageUrl: listing.image,
        tags: [...listing.tags],
        status: "published",
        verificationStatus: "verified",
        publishedAt: new Date(listing.publishedAt),
      },
    });
  }

  console.log(`Seeded ${availableListings.length} published listings.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
