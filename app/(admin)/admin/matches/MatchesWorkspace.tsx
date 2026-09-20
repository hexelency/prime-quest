"use client";

import { useState } from "react";
import styles from "./matches.module.css";

type Match = { id: string; score: number; status: string; createdAt: string; buyerRequestId: string; sellerMandateId: string; meeting?: { id: string; status: string }; buyerRequest?: { requestText: string; contactName: string | null; contactEmail: string | null; contactPhone: string | null; timezone: string | null; preferredCallWindows: string[]; meetingConsent: boolean; contactConsent: boolean }; sellerMandate?: { product: string; assetType: string; contactName: string | null; contactEmail: string | null; contactPhone: string | null; timezone: string | null; preferredCallWindows: string[]; meetingConsent: boolean; contactConsent: boolean } };

function nextSlot(match: Match) { const window = match.buyerRequest?.preferredCallWindows?.[0] ?? "Weekday afternoons (12:00-17:00)"; const start = window.match(/\(([^-]+)/)?.[1] ?? "14:00"; const date = new Date(); date.setDate(date.getDate() + (date.getDay() === 5 ? 3 : date.getDay() === 6 ? 2 : 1)); return `${date.toISOString().slice(0, 10)}T${start}`; }

export default function MatchesWorkspace({ initialMatches }: { initialMatches: Match[] }) {
  const [matches, setMatches] = useState(initialMatches);
  const [selected, setSelected] = useState<Match | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function createMeeting() {
    if (!selected || selected.meeting) return;
    setBusy(true); setError("");
    try { const response = await fetch("/api/admin/meetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchId: selected.id, scheduledAt: nextSlot(selected), timezone: selected.buyerRequest?.timezone || "Africa/Lagos" }) }); const result = await response.json() as { error?: string; meeting?: Match["meeting"] }; if (!response.ok) throw new Error(result.error ?? "Could not create meeting."); if (result.meeting) { const updated = { ...selected, meeting: result.meeting }; setSelected(updated); setMatches((current) => current.map((match) => match.id === selected.id ? updated : match)); } setNotice("Pending meeting created. No link was sent."); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create meeting."); } finally { setBusy(false); }
  }

  async function closeDeal() {
    if (!selected || !window.confirm("Close this matched opportunity as a deal?")) return;
    setBusy(true); setError("");
    try { const response = await fetch("/api/admin/deals", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchId: selected.id, status: "closed" }) }); const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error ?? "Could not close deal."); setMatches((current) => current.filter((match) => match.id !== selected.id)); setSelected(null); setNotice("Deal closed and moved to the Closed deals archive."); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not close deal."); } finally { setBusy(false); }
  }

  return <main className={styles.page}><header className={styles.header}><div><p className={styles.eyebrow}>Operations intelligence</p><h1>Matched opportunities</h1><p className={styles.description}>Review both sides of a potential match, coordinate a meeting, or close the opportunity as a managed deal.</p></div><a className={styles.archiveLink} href="/admin/deals">Closed deals ↗</a></header>{(notice || error) && <p className={error ? styles.error : styles.notice} role="status">{error || notice}</p>}<section className={styles.tablePanel}><table><thead><tr>{["Match ID", "Score", "Buyer", "Seller", "Status", "Action"].map((label) => <th key={label}>{label}</th>)}</tr></thead><tbody>{matches.map((match) => <tr key={match.id}><td className={styles.id}>{match.id.slice(0, 8).toUpperCase()}</td><td>{match.score}/100</td><td>{match.buyerRequest?.contactName || "Buyer"}<small>{match.buyerRequest?.requestText}</small></td><td>{match.sellerMandate?.product || "Seller mandate"}<small>{match.sellerMandate?.contactName || "Contact pending"}</small></td><td>{match.status}</td><td><button type="button" onClick={() => { setSelected(match); setNotice(""); setError(""); }}>Open match</button></td></tr>)}</tbody></table>{!matches.length && <p className={styles.empty}>No matches have been created yet.</p>}</section>{selected && <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-label="Matched opportunity details"><header className={styles.modalHeader}><div><p className={styles.eyebrow}>Match {selected.id.slice(0, 8).toUpperCase()}</p><h2>Coordinate opportunity</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Close match">×</button></header><div className={styles.peopleGrid}><article><span>Buyer inquiry</span><h3>{selected.buyerRequest?.contactName || "Buyer pending"}</h3><p>{selected.buyerRequest?.requestText}</p><strong>{selected.buyerRequest?.contactEmail || "No email"}</strong></article><article><span>Seller mandate</span><h3>{selected.sellerMandate?.product || "Seller pending"}</h3><p>{selected.sellerMandate?.contactName || "Contact pending"}</p><strong>{selected.sellerMandate?.contactEmail || "No email"}</strong></article></div><div className={styles.modalActions}><button type="button" onClick={createMeeting} disabled={busy || Boolean(selected.meeting)}>{selected.meeting ? `Meeting ${selected.meeting.status}` : busy ? "Creating..." : "Create pending meeting"}</button><button type="button" onClick={closeDeal} disabled={busy}>Close deal</button><button type="button" onClick={() => setSelected(null)}>Close</button></div></section></div>}</main>;
}
