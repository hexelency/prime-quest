"use client";

import { useEffect, useState } from "react";
import AvailableListings from "@/app/(marketplace)/components/AvailableListings";
import type { AvailableListing } from "@/lib/available-listings";

export default function AvailableSection() {
  const [listings, setListings] = useState<AvailableListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/market/listings")
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Could not load listings.")))
      .then((data: { listings?: AvailableListing[] }) => setListings(data.listings ?? []))
      .catch(() => setListings([]))
      .finally(() => setLoading(false));
  }, []);

  return <section className="available-section section-space" id="available-listings"><div className="shell"><div className="section-heading"><div><p className="eyebrow accent">Published availability</p><h2>Find what is<br /><em>available now.</em></h2></div><p>Search and filter the current admin-published availability feed across vessels, properties, land, track farms and oil & gas.</p></div>{loading ? <div className="available-grid available-skeleton-grid" aria-label="Loading listings" aria-busy="true">{Array.from({ length: 15 }, (_, index) => <article className="available-skeleton-card" key={index}><div className="available-skeleton-media" /><div className="available-skeleton-body"><span /><span /><strong /><i /><i /><b /></div></article>)}</div> : <AvailableListings listings={listings} />}</div></section>;
}
