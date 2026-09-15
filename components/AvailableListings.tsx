"use client";

import { useMemo, useState } from "react";
import { availableListings, type AvailableCategory } from "@/lib/available-listings";

const categories: { value: "all" | AvailableCategory; label: string }[] = [
  { value: "all", label: "All services" },
  { value: "vessels", label: "Vessels" },
  { value: "property", label: "Properties" },
  { value: "land", label: "Land" },
  { value: "track-farms", label: "Track farms" },
  { value: "energy", label: "Oil & gas" },
];

const categoryNames: Record<AvailableCategory, string> = { vessels: "Vessel", property: "Property", land: "Land", "track-farms": "Track farm", energy: "Oil & gas" };

function whatsappLink(ref: string) {
  return `https://wa.me/2348038128933?text=${encodeURIComponent(`Hello PrimeQuest, I would like more information about available listing ${ref}.`)}`;
}

export default function AvailableListings() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | AvailableCategory>("all");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "title">("newest");

  const tags = useMemo(() => ["all", ...Array.from(new Set(availableListings.flatMap((listing) => listing.tags)))], []);
  const visibleListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return availableListings.filter((listing) => {
      const matchesQuery = !normalizedQuery || [listing.ref, listing.title, listing.type, listing.location, listing.summary].some((value) => value.toLowerCase().includes(normalizedQuery));
      const matchesCategory = category === "all" || listing.category === category;
      const matchesTag = tag === "all" || listing.tags.includes(tag);
      return matchesQuery && matchesCategory && matchesTag;
    }).sort((first, second) => sort === "title" ? first.title.localeCompare(second.title) : sort === "newest" ? second.publishedAt.localeCompare(first.publishedAt) : first.publishedAt.localeCompare(second.publishedAt));
  }, [category, query, sort, tag]);

  return (
    <div className="available-listings" id="available-listings">
      <div className="listing-controls"><label>Search<input aria-label="Search listings" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Reference, title or location" /></label><label>Category<select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value as "all" | AvailableCategory)}>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label>Tag<select aria-label="Filter by tag" value={tag} onChange={(event) => setTag(event.target.value)}>{tags.map((item) => <option key={item} value={item}>{item === "all" ? "All tags" : item}</option>)}</select></label><label>Sort<select aria-label="Sort listings" value={sort} onChange={(event) => setSort(event.target.value as "newest" | "oldest" | "title")}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A-Z</option></select></label></div><div className="available-meta"><span>{visibleListings.length} of {availableListings.length} available records</span><span>Admin-published inventory feed · demo data</span></div>{visibleListings.length ? <div className="available-grid">{visibleListings.map((listing) => <article className="available-card" key={listing.ref}><div className="available-card-media"><img src={listing.image} alt={`Dummy image for ${listing.title}`} loading="lazy" /><div className="listing-tags">{listing.tags.map((item) => <span key={item}>{item}</span>)}</div></div><div className="available-card-body"><div className="available-card-top"><span className="service-number">{listing.ref}</span><span className="available-category">{categoryNames[listing.category]}</span></div><h3>{listing.title}</h3><p className="available-type">{listing.type} · {listing.location}</p><p>{listing.summary}</p><a className="table-link" href={whatsappLink(listing.ref)} target="_blank" rel="noreferrer">Request details ↗</a></div></article>)}</div> : <div className="empty-listings"><p className="state-label">No matching listings</p><h3>Try another search or filter.</h3><p>Approved inventory will remain available here as the admin team publishes it.</p></div>}
    </div>
  );
}
