"use client";

import { useMemo, useState } from "react";
import { availableListings, type AvailableCategory } from "@/lib/available-listings";
import { useEffect } from "react";
import type { MarketAsset, MarketBuyer } from "@/lib/demo-market-intelligence";
import styles from "./admin-dashboard.module.css";
import ListingManager from "@/app/(admin)/components/ListingManager";

const categoryLabels: Record<AvailableCategory, string> = {
  vessels: "Vessels",
  property: "Property",
  land: "Land",
  "track-farms": "Track farms",
  energy: "Oil & gas",
};

const reviewItems = availableListings.slice(0, 5);

export default function AdminDashboard() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"all" | AvailableCategory>("all");
  const [activeView, setActiveView] = useState("Overview");
  const [marketAssets, setMarketAssets] = useState<MarketAsset[]>([]);
  const [marketBuyers, setMarketBuyers] = useState<MarketBuyer[]>([]);
  const [marketDatabase, setMarketDatabase] = useState("preview");
  const [overview, setOverview] = useState({ inquiries: 0, mandates: 0, matches: 0, meetings: 0, pendingMeetings: 0 });

  useEffect(() => {
    fetch("/api/admin/market-intelligence")
      .then(async (response) => {
        const result = await response.json() as { assets?: MarketAsset[]; buyers?: MarketBuyer[]; database?: string };
        if (!response.ok) throw new Error("Could not load market intelligence.");
        setMarketAssets(result.assets ?? []);
        setMarketBuyers(result.buyers ?? []);
        setMarketDatabase(result.database ?? "preview");
      })
      .catch(() => setMarketDatabase("unavailable"));
  }, []);

  useEffect(() => {
    fetch("/api/admin/overview").then((response) => response.json()).then((result: { counts?: Partial<typeof overview> }) => setOverview((current) => ({ ...current, ...result.counts }))).catch(() => undefined);
  }, []);

  const filteredListings = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return availableListings.filter((listing) => {
      const matchesCategory = category === "all" || listing.category === category;
      const matchesQuery = !normalizedQuery || [listing.ref, listing.title, listing.location].some((value) => value.toLowerCase().includes(normalizedQuery));
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  return (
    <main className={styles.dashboard}>
      <section className={styles.mainPanel}>
        <header className={styles.topbar}>
          <div>
            <p className={styles.overline}>Tuesday, September 15, 2026</p>
            <h1>{activeView}</h1>
          </div>
          <div className={styles.accountArea}>
            <span className={styles.statusDot} />
            <span>Admin account</span>
            <span className={styles.avatar}>PQ</span>
          </div>
        </header>

        <div className={styles.content}>
          <section className={styles.statsGrid} aria-label="Workspace summary">
            <article className={styles.statCard}><span>Buyer inquiries</span><strong>{overview.inquiries}</strong><small>Captured requests</small></article>
            <article className={styles.statCard}><span>Seller mandates</span><strong>{overview.mandates}</strong><small>Submitted mandates</small></article>
            <article className={styles.statCard}><span>Matched opportunities</span><strong>{overview.matches}</strong><small className={styles.warningText}>Database matches</small></article>
            <article className={styles.statCard}><span>Pending meetings</span><strong>{overview.pendingMeetings}</strong><small>Awaiting link delivery</small></article>
            <article className={styles.statCard}><span>Total meetings</span><strong>{overview.meetings}</strong><small className={styles.positiveText}>Created records</small></article>
          </section>

          <section className={styles.intelligenceGrid} aria-label="AI market intelligence">
            <div className={styles.panel}>
              <div className={styles.panelHeader}><div><p className={styles.overline}>AI discovery · {marketDatabase}</p><h2>Assets found for sale</h2></div><span className={styles.panelMeta}>{marketAssets.length} signals</span></div>
              <div className={styles.intelligenceList}>{marketAssets.map((asset) => <article className={styles.intelligenceRow} key={asset.id}><span className={styles.ref}>{asset.reference}</span><div><strong>{asset.title}</strong><span>{asset.asset_type} · {asset.location}</span></div><span className={styles.signalBadge}>{asset.confidence_score}% match</span><a href={asset.source_url} target="_blank" rel="noreferrer" aria-label={`Open source for ${asset.title}`}>Source ↗</a></article>)}</div>
            </div>
            <div className={styles.panel}>
              <div className={styles.panelHeader}><div><p className={styles.overline}>AI discovery · buyer demand</p><h2>Companies and investors</h2></div><span className={styles.panelMeta}>{marketBuyers.length} signals</span></div>
              <div className={styles.intelligenceList}>{marketBuyers.map((buyer) => <article className={styles.intelligenceRow} key={buyer.id}><span className={styles.ref}>BUY</span><div><strong>{buyer.company_name}</strong><span>{buyer.country} · Potential {buyer.kind}</span></div><span className={styles.signalBadge}>{buyer.confidence_score}% match</span><a href={buyer.source_url} target="_blank" rel="noreferrer" aria-label={`Open source for ${buyer.company_name}`}>Source ↗</a></article>)}</div>
            </div>
          </section>

          <section className={styles.gridPrimary}>
            <div className={styles.panel}>
              <div className={styles.panelHeader}><div><p className={styles.overline}>Needs a decision</p><h2>Review queue</h2></div><button className={styles.textButton} type="button" onClick={() => setActiveView("Seller mandates")}>View all <span aria-hidden="true">↗</span></button></div>
              <div className={styles.reviewList}>
                {reviewItems.map((listing, index) => (
                  <article className={styles.reviewRow} key={listing.ref}>
                    <span className={styles.ref}>{listing.ref}</span>
                    <div className={styles.reviewDetails}><strong>{listing.title}</strong><span>{categoryLabels[listing.category]} · {listing.location}</span></div>
                    <span className={index < 2 ? styles.badgePending : styles.badgeReview}>{index < 2 ? "New intake" : "Needs review"}</span>
                    <button className={styles.rowAction} type="button" aria-label={`Open ${listing.ref}`}>Open <span aria-hidden="true">↗</span></button>
                  </article>
                ))}
              </div>
            </div>

            <div className={styles.panel}>
              <div className={styles.panelHeader}><div><p className={styles.overline}>Inventory mix</p><h2>By category</h2></div><span className={styles.panelMeta}>25 records</span></div>
              <div className={styles.categoryList}>
                {(Object.keys(categoryLabels) as AvailableCategory[]).map((item) => {
                  const count = availableListings.filter((listing) => listing.category === item).length;
                  const width = `${(count / availableListings.length) * 100}%`;
                  return <div className={styles.categoryRow} key={item}><div><span>{categoryLabels[item]}</span><strong>{String(count).padStart(2, "0")}</strong></div><div className={styles.progressTrack}><span style={{ width }} /></div></div>;
                })}
              </div>
            </div>
          </section>

          <ListingManager compact />
        </div>
      </section>
    </main>
  );
}
