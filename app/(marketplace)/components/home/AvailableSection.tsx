"use client";

import { useEffect, useState } from "react";
import AvailableListings from "@/app/(marketplace)/components/AvailableListings";
import type { AvailableListing } from "@/lib/available-listings";

export default function AvailableSection() {
  const [listings, setListings] = useState<AvailableListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    fetch("/api/market/listings", { signal: controller.signal, cache: "no-store" })
      .then(async (response) => {
        const data = await response.json() as { listings?: AvailableListing[]; error?: string };
        if (!response.ok) throw new Error(data.error ?? "Could not load listings.");
        return data;
      })
      .then((data) => {
        setListings(data.listings ?? []);
        setError("");
      })
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") {
          setError("The availability feed took too long to respond.");
        } else {
          setError(reason instanceof Error ? reason.message : "Could not load listings.");
        }
        setListings([]);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        setLoading(false);
      });

    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);

  return <section className="available-section section-space" id="available-listings"><div className="shell"><div className="section-heading"><div><p className="eyebrow accent">Published availability</p><h2>Find what is<br /><em>available now.</em></h2></div><p>Search and filter the current admin-published availability feed across vessels, properties, land, track farms and oil & gas.</p></div>{loading ? <div className="available-grid available-skeleton-grid" aria-label="Loading listings" aria-busy="true">{Array.from({ length: 15 }, (_, index) => <article className="available-skeleton-card" key={index}><div className="available-skeleton-media" /><div className="available-skeleton-body"><span /><span /><strong /><i /><i /><b /></div></article>)}</div> : error ? <div className="empty-listings"><p className="state-label">Availability unavailable</p><h3>{error}</h3><p>Refresh the page or contact PrimeQuest for the current inventory feed.</p></div> : <AvailableListings listings={listings} />}</div></section>;
}
