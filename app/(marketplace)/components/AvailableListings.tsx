"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import ListingInterestModal from "@/components/ListingInterestModal";
import type { AvailableCategory, AvailableListing } from "@/lib/available-listings";
import ShareListing from "@/app/(marketplace)/components/ShareListing";

const categories: { value: "all" | AvailableCategory; label: string }[] = [
  { value: "all", label: "All services" }, { value: "vessels", label: "Vessels" }, { value: "property", label: "Properties" },
  { value: "land", label: "Land" }, { value: "track-farms", label: "Track farms" }, { value: "energy", label: "Oil & gas" },
];
const categoryNames: Record<AvailableCategory, string> = { vessels: "Vessel", property: "Property", land: "Land", "track-farms": "Track farm", energy: "Oil & gas" };

const listingGridReveal: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const listingCardReveal: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export default function AvailableListings({ listings }: { listings: readonly AvailableListing[] }) {
  const reduceMotion = useReducedMotion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | AvailableCategory>("all");
  const [tag, setTag] = useState("all");
  const [sort, setSort] = useState<"newest" | "oldest" | "title">("newest");
  const [selectedListing, setSelectedListing] = useState<AvailableListing | null>(null);
  useEffect(() => {
    const ref = new URLSearchParams(window.location.search).get("listing");
    const listing = listings.find((item) => item.ref === ref);
    if (listing) setSelectedListing(listing);
  }, [listings]);
  const tags = useMemo(() => ["all", ...Array.from(new Set(listings.flatMap((listing) => listing.tags)))], [listings]);
  const visibleListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return listings.filter((listing) => {
      const matchesQuery = !normalizedQuery || [listing.ref, listing.title, listing.type, listing.location, listing.summary].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesQuery && (category === "all" || listing.category === category) && (tag === "all" || listing.tags.includes(tag));
    }).sort((first, second) => sort === "title" ? first.title.localeCompare(second.title) : sort === "newest" ? second.publishedAt.localeCompare(first.publishedAt) : first.publishedAt.localeCompare(second.publishedAt));
  }, [category, listings, query, sort, tag]);

  return <div className="available-listings" id="available-listings">
    <div className="listing-controls"><label>Search<input aria-label="Search listings" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Reference, title or location" /></label><label>Category<select aria-label="Filter by category" value={category} onChange={(event) => setCategory(event.target.value as "all" | AvailableCategory)}>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label><label>Tag<select aria-label="Filter by tag" value={tag} onChange={(event) => setTag(event.target.value)}>{tags.map((item) => <option key={item} value={item}>{item === "all" ? "All tags" : item}</option>)}</select></label><label>Sort<select aria-label="Sort listings" value={sort} onChange={(event) => setSort(event.target.value as "newest" | "oldest" | "title")}><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="title">Title A-Z</option></select></label></div>
    <div className="available-meta"><span>{visibleListings.length} of {listings.length} available records</span><span>PrimeQuest-published inventory feed</span></div>
    {visibleListings.length ? <motion.div className="available-grid" initial={reduceMotion ? false : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.12 }} variants={listingGridReveal}>{visibleListings.map((listing) => <motion.article className="available-card" key={listing.ref} variants={listingCardReveal}><div className="available-card-media"><img src={listing.image} alt={listing.title} loading="lazy" /><div className="listing-tags">{listing.tags.map((item) => <span key={item}>{item}</span>)}</div></div><div className="available-card-body"><div className="available-card-top"><span className="service-number">{listing.ref}</span><span className="available-category">{categoryNames[listing.category]}</span></div><h3>{listing.title}</h3><p className="available-type">{listing.type} · {listing.location}</p><p>{listing.summary}</p><div className="available-card-actions"><button className="table-link listing-details-button" type="button" onClick={() => setSelectedListing(listing)}>Request details ↗</button><ShareListing listing={listing} /></div></div></motion.article>)}</motion.div> : <div className="empty-listings"><p className="state-label">No matching listings</p><h3>Try another search or filter.</h3><p>Approved inventory will remain available here as PrimeQuest publishes it.</p></div>}
    {selectedListing && <ListingInterestModal listing={selectedListing} onClose={() => setSelectedListing(null)} />}
  </div>;
}
