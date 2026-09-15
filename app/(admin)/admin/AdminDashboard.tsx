"use client";

import { useMemo, useState } from "react";
import { availableListings, type AvailableCategory } from "@/lib/available-listings";
import styles from "./admin-dashboard.module.css";

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
          <div className={styles.notice} role="status">
            <span className={styles.noticeMark}>i</span>
            <span><strong>Demo inventory mode.</strong> Records shown here are static preview data and are not connected to publishing or storage.</span>
            <button type="button" aria-label="Dismiss demo notice">Dismiss</button>
          </div>

          <section className={styles.statsGrid} aria-label="Workspace summary">
            <article className={styles.statCard}><span>Total inventory</span><strong>{availableListings.length}</strong><small>Across 5 categories</small></article>
            <article className={styles.statCard}><span>Awaiting review</span><strong>08</strong><small className={styles.warningText}>Needs attention</small></article>
            <article className={styles.statCard}><span>Open inquiries</span><strong>12</strong><small>Since last Monday</small></article>
            <article className={styles.statCard}><span>Published this month</span><strong>06</strong><small className={styles.positiveText}>+18% from August</small></article>
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

          <section className={styles.panel}>
            <div className={styles.panelHeader}><div><p className={styles.overline}>Admin-published inventory</p><h2>Listings</h2></div><button className={styles.primaryButton} type="button">+ Add listing</button></div>
            <div className={styles.filters}>
              <label>Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search references or titles" /></label>
              <label>Category<select value={category} onChange={(event) => setCategory(event.target.value as "all" | AvailableCategory)}><option value="all">All categories</option>{(Object.keys(categoryLabels) as AvailableCategory[]).map((item) => <option value={item} key={item}>{categoryLabels[item]}</option>)}</select></label>
              <span className={styles.resultCount}>{filteredListings.length} records</span>
            </div>
            <div className={styles.tableWrap}><table className={styles.table}><thead><tr><th>Reference</th><th>Listing</th><th>Category</th><th>Location</th><th>Published</th><th>Status</th><th /></tr></thead><tbody>{filteredListings.slice(0, 8).map((listing) => <tr key={listing.ref}><td className={styles.ref}>{listing.ref}</td><td><strong>{listing.title}</strong><small>{listing.type}</small></td><td>{categoryLabels[listing.category]}</td><td>{listing.location}</td><td>{listing.publishedAt}</td><td><span className={styles.liveStatus}>Preview</span></td><td><button className={styles.moreButton} type="button" aria-label={`More actions for ${listing.ref}`}>•••</button></td></tr>)}</tbody></table></div>
          </section>
        </div>
      </section>
    </main>
  );
}
