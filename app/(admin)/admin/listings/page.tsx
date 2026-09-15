import AdminRecordsPage from "@/app/(admin)/components/AdminRecordsPage";
import { availableListings } from "@/lib/available-listings";

export default function AdminListingsPage() {
  return <AdminRecordsPage eyebrow="Inventory operations" title="Listings" description="Review, prepare and manage the opportunities that may be published to the public marketplace." records={availableListings.slice(0, 10).map((listing) => ({ ref: listing.ref, title: listing.title, detail: `${listing.type} · ${listing.location}`, status: "preview", date: listing.publishedAt }))} />;
}
