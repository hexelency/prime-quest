"use client";

import { useState } from "react";
import styles from "./deals.module.css";

type Deal = { id: string; score: number; reviewedAt: string; buyer: { contactName: string | null; contactEmail: string | null; requestText: string }; seller: { product: string; contactName: string | null; contactEmail: string | null }; meetings: Array<{ id: string; status: string; scheduledAt: string }> };

export default function ClosedDealsWorkspace({ initialDeals }: { initialDeals: Deal[] }) {
  const [deals, setDeals] = useState(initialDeals);
  const [busy, setBusy] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function reopen(deal: Deal) {
    setBusy(deal.id); setError("");
    try { const response = await fetch("/api/admin/deals", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchId: deal.id, status: "potential" }) }); if (!response.ok) throw new Error("Could not reopen deal."); setDeals((current) => current.filter((item) => item.id !== deal.id)); setMessage("Deal moved back to matched opportunities."); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not reopen deal."); } finally { setBusy(""); }
  }

  async function remove(deal: Deal) {
    if (!window.confirm("Delete this closed deal and its connected meeting records?")) return;
    setBusy(deal.id); setError("");
    try { const response = await fetch("/api/admin/deals", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ matchId: deal.id }) }); const result = await response.json() as { error?: string }; if (!response.ok) throw new Error(result.error ?? "Could not delete closed deal."); setDeals((current) => current.filter((item) => item.id !== deal.id)); setMessage("Closed deal deleted; connected meeting records were cascaded."); } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete closed deal."); } finally { setBusy(""); }
  }

  return <main className={styles.page}><header className={styles.header}><div><p className={styles.eyebrow}>Deal archive</p><h1>Closed deals</h1><p className={styles.description}>Manage completed matched opportunities. Deleting a deal removes its connected meeting records while preserving the original buyer and seller records.</p></div><a href="/admin/matches">Matched opportunities ↗</a></header>{(message || error) && <p className={error ? styles.error : styles.notice} role="status">{error || message}</p>}<section className={styles.tablePanel}><table><thead><tr><th>Deal</th><th>Buyer</th><th>Seller</th><th>Meetings</th><th>Closed</th><th>Actions</th></tr></thead><tbody>{deals.map((deal) => <tr key={deal.id}><td className={styles.id}>{deal.id.slice(0, 8).toUpperCase()}<small>{deal.score}/100 match</small></td><td>{deal.buyer.contactName || "Buyer"}<small>{deal.buyer.contactEmail || "No email"}</small></td><td>{deal.seller.product}<small>{deal.seller.contactName || "Seller"}</small></td><td>{deal.meetings.length}<small>{deal.meetings.map((meeting) => meeting.status).join(", ") || "No meetings"}</small></td><td>{new Date(deal.reviewedAt).toLocaleDateString()}</td><td className={styles.actions}><button type="button" disabled={busy === deal.id} onClick={() => reopen(deal)}>Reopen</button><button className={styles.danger} type="button" disabled={busy === deal.id} onClick={() => remove(deal)}>Delete</button></td></tr>)}</tbody></table>{!deals.length && <p className={styles.empty}>No closed deals have been archived.</p>}</section></main>;
}
