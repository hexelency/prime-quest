import { notFound } from "next/navigation";
import OfferingCategoryPage from "@/app/(marketplace)/components/OfferingCategoryPage";
import { resolveAvailableCategory } from "@/lib/available-category";
import { getPublishedAvailableListings } from "@/lib/server/available-listings";

type OfferingsPageProps = {
  searchParams: Promise<{
    category?: string | string[];
    service?: string | string[];
  }>;
};

export default async function OfferingsPage({ searchParams }: OfferingsPageProps) {
  const query = await searchParams;
  const category = resolveAvailableCategory(query.category ?? query.service);

  if (!category) notFound();

  const listings = await getPublishedAvailableListings(category);
  return <OfferingCategoryPage category={category} listings={listings} />;
}
