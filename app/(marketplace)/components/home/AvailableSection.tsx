"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import AvailableListings from "@/app/(marketplace)/components/AvailableListings";
import type { AvailableListing } from "@/lib/available-listings";

type AvailableSectionProps = {
  onDataLoaded: (loaded: boolean) => void;
};

const availabilityHeadingReveal: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease: "easeOut" } },
};

const availabilityFeedReveal: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, delay: 0.12, ease: "easeOut" } },
};

export default function AvailableSection({ onDataLoaded }: AvailableSectionProps) {
  const reduceMotion = useReducedMotion();
  const [listings, setListings] = useState<AvailableListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isActive = true;
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
        if (!isActive) return;
        if (reason instanceof DOMException && reason.name === "AbortError") {
          setError("The availability feed took too long to respond.");
        } else {
          setError(reason instanceof Error ? reason.message : "Could not load listings.");
        }
        setListings([]);
      })
      .finally(() => {
        window.clearTimeout(timeout);
        if (isActive) {
          setLoading(false);
          onDataLoaded(true);
        }
      });

    return () => {
      isActive = false;
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, [onDataLoaded]);

  return <section className="available-section section-space" id="available-listings"><div className="shell"><motion.div className="section-heading" variants={availabilityHeadingReveal} initial={reduceMotion ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.12 }}><div><p className="eyebrow accent">Published availability</p><h2>Find what is<br /><em>available now.</em></h2></div><p>Search and filter the current admin-published availability feed across vessels, properties, land, track farms and oil & gas.</p></motion.div><motion.div variants={availabilityFeedReveal} initial={reduceMotion ? "visible" : "hidden"} whileInView="visible" viewport={{ once: true, amount: 0.08 }}>{loading ? <div className="available-grid available-skeleton-grid" aria-label="Loading listings" aria-busy="true">{Array.from({ length: 15 }, (_, index) => <article className="available-skeleton-card" key={index}><div className="available-skeleton-media" /><div className="available-skeleton-body"><span /><span /><strong /><i /><i /><b /></div></article>)}</div> : error ? <div className="empty-listings"><p className="state-label">Availability unavailable</p><h3>{error}</h3><p>Refresh the page or contact PrimeQuest for the current inventory feed.</p></div> : <AvailableListings listings={listings} />}</motion.div></div></section>;
}
