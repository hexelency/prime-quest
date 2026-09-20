"use client";

import { useState, type FormEvent } from "react";
import styles from "./matching.module.css";

type Props = { buyerRequestId?: string; sellerMandateId?: string };
type Candidate = { title?: string; source_url?: string; source_platform?: string; source_summary?: string; image_url?: string };

export default function MatchingWorkspace({ buyerRequestId, sellerMandateId }: Props) {
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [urls, setUrls] = useState("");
  const [candidates, setCandidates] = useState<Candidate[]>([]);

  async function runDatabaseMatch() {
    setBusy("database"); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/matching", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope: sellerMandateId || buyerRequestId ? "selected" : "all", sellerMandateId, buyerRequestId }) });
      const result = await response.json() as { error?: string; matches?: number; notificationsCreated?: number };
      if (!response.ok) throw new Error(result.error ?? "Could not run database matching.");
      setMessage(`${result.matches ?? 0} database match${result.matches === 1 ? "" : "es"} found. ${result.notificationsCreated ?? 0} new review notification${result.notificationsCreated === 1 ? "" : "s"} created.`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not run database matching."); } finally { setBusy(""); }
  }

  async function runWebSearch(event: FormEvent) {
    event.preventDefault();
    const sourceUrls = urls.split(/\r?\n|,/).map((url) => url.trim()).filter(Boolean);
    if (!sourceUrls.length) { setError("Add at least one HTTPS source URL."); return; }
    setBusy("web"); setError(""); setMessage("");
    try {
      const response = await fetch("/api/admin/discovery/scrape", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ urls: sourceUrls }) });
      const result = await response.json() as { error?: string; candidates?: Candidate[]; errors?: Array<{ url: string; error: string }> };
      if (!response.ok) throw new Error(result.error ?? "Could not search sources.");
      setCandidates(result.candidates ?? []);
      setMessage(`${result.candidates?.length ?? 0} web candidate${result.candidates?.length === 1 ? "" : "s"} found. Review them before saving or publishing.`);
      if (result.errors?.length) setError(`${result.errors.length} source${result.errors.length === 1 ? "" : "s"} could not be read.`);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not search sources."); } finally { setBusy(""); }
  }

  const context = sellerMandateId ? "this seller mandate" : buyerRequestId ? "this buyer inquiry" : "the current workspace";
  return <main className={styles.page}><header className={styles.header}><a href="/admin">Back to operations desk</a><p className={styles.eyebrow}>Match discovery</p><h1>Find the right counterparties.</h1><p className={styles.description}>Choose how PrimeQuest should look for matches for {context}. Every result remains subject to admin review.</p></header><section className={styles.grid}><article className={styles.card}><span className={styles.number}>01</span><h2>Database match</h2><p>Compare the request or mandate against active records already captured in PrimeQuest.</p><button type="button" onClick={runDatabaseMatch} disabled={Boolean(busy)}>{busy === "database" ? "Matching..." : "Run database match"}</button></article><article className={styles.card}><span className={styles.number}>02</span><h2>Recurring contacts</h2><p>Review prior buyer or seller contacts already in the database before starting new outreach.</p><a href={buyerRequestId ? `/admin/inquiries?focus=${buyerRequestId}` : sellerMandateId ? `/admin/mandates?focus=${sellerMandateId}` : "/admin/inquiries"}>Open contact records</a></article><article className={styles.card}><span className={styles.number}>03</span><h2>AI match</h2><p>Ask the intelligence assistant to compare the request with mandates, leads, risks and context.</p><a href="/admin/ai">Open AI control center</a></article><article className={styles.card}><span className={styles.number}>04</span><h2>Web search / scraping</h2><p>Submit approved HTTPS research sources. Scraped candidates are unverified until an admin reviews them.</p><form onSubmit={runWebSearch}><textarea value={urls} onChange={(event) => setUrls(event.target.value)} placeholder="https://approved-source.example/page" aria-label="Approved HTTPS source URLs" rows={3} /><button type="submit" disabled={Boolean(busy)}>{busy === "web" ? "Searching..." : "Search approved sources"}</button></form></article></section>{(message || error) && <p className={error ? styles.error : styles.notice} role="status">{error || message}</p>}{candidates.length > 0 && <section className={styles.results}><h2>Review web candidates</h2>{candidates.map((candidate, index) => <article key={`${candidate.source_url}-${index}`}>{candidate.image_url && <img src={candidate.image_url} alt="" />}<div><strong>{candidate.title || "Untitled candidate"}</strong><span>{candidate.source_platform || "Source platform pending"}</span><p>{candidate.source_summary || "No public summary was returned."}</p></div>{candidate.source_url && <a href={candidate.source_url} target="_blank" rel="noreferrer">Open source</a>}</article>)}</section>}</main>;
}
