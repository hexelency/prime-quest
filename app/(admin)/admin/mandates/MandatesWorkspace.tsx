"use client";

import { useMemo, useState } from "react";
import styles from "@/app/(admin)/components/admin-records.module.css";

type Attachment = { id: string; fileName: string; storagePath: string; mimeType: string; fileSize: number };
export type MandateRecord = { id: string; product: string; assetType: string; location: string; terms: string; imoNumber: string; verificationDetails: string; contactName: string; contactEmail: string; contactPhone: string; status: string; verificationStatus: string; source: string; consentVersion: string; consentAcceptedAt: string; contactConsent: boolean; meetingConsent: boolean; preferredCallWindows: string[]; timezone: string; matchCount: number; createdAt: string; attachments: Attachment[] };

const statuses = ["new", "under_review", "active", "matched", "closed", "expired"];

export default function MandatesWorkspace({ initialRecords }: { initialRecords: MandateRecord[] }) {
  const [records, setRecords] = useState(initialRecords);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [selected, setSelected] = useState<MandateRecord | null>(null);
  const [busyId, setBusyId] = useState("");
  const [matching, setMatching] = useState(false);
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [error, setError] = useState("");
  const [publishReference, setPublishReference] = useState("");
  const [publishTitle, setPublishTitle] = useState("");
  const [publishedReference, setPublishedReference] = useState("");

  const visible = useMemo(() => records.filter((record) => {
    const needle = query.trim().toLowerCase();
    return (!needle || `${record.id} ${record.product} ${record.assetType} ${record.location} ${record.contactName} ${record.contactEmail}`.toLowerCase().includes(needle)) && (status === "all" || record.status === status);
  }), [query, records, status]);

  function openMandate(record: MandateRecord) {
    setSelected(record);
    setPublishReference(`M-${record.id.slice(0, 8).toUpperCase()}`);
    setPublishTitle(record.product);
    setPublishedReference("");
    setMessage("");
    setError("");
  }

  async function remove(record: MandateRecord) {
    if (!window.confirm(`Delete this mandate from ${record.contactName || "the seller"}?`)) return;
    setBusyId(record.id);
    try {
      const response = await fetch(`/api/admin/mandates/${record.id}`, { method: "DELETE" });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not delete mandate.");
      setRecords((current) => current.filter((item) => item.id !== record.id));
      setSelected(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not delete mandate.");
    } finally {
      setBusyId("");
    }
  }

  async function publish(record: MandateRecord) {
    setBusyId(record.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/mandates/${record.id}/publish`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference: publishReference, title: publishTitle, category: "energy", tags: [] }) });
      const result = await response.json() as { error?: string; listing?: { reference?: string } };
      if (!response.ok) throw new Error(result.error ?? "Could not publish listing.");
      setPublishedReference(result.listing?.reference ?? publishReference);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not publish listing.");
    } finally {
      setBusyId("");
    }
  }

  async function updateStatus(record: MandateRecord, nextStatus: string) {
    setBusyId(record.id);
    setError("");
    try {
      const response = await fetch(`/api/admin/mandates/${record.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: nextStatus }) });
      const result = await response.json() as { error?: string; mandate?: MandateRecord };
      if (!response.ok || !result.mandate) throw new Error(result.error ?? "Could not update mandate.");
      setRecords((current) => current.map((item) => item.id === record.id ? { ...item, status: nextStatus } : item));
      setSelected((current) => current?.id === record.id ? { ...current, status: nextStatus } : current);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not update mandate.");
    } finally {
      setBusyId("");
    }
  }

  async function runMatching(scope: "selected" | "all", record?: MandateRecord) {
    setMatching(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/matching", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope, sellerMandateId: record?.id }) });
      const result = await response.json() as { error?: string; matches?: number; notificationsCreated?: number; unmatchedMandates?: unknown[]; outreachCandidates?: unknown[] };
      if (!response.ok) throw new Error(result.error ?? "Could not scan for matches.");
      const unmatched = result.unmatchedMandates?.length ?? 0;
      setMessage(`${result.matches ?? 0} match${result.matches === 1 ? "" : "es"} found; ${result.notificationsCreated ?? 0} notification${result.notificationsCreated === 1 ? "" : "s"} created.${unmatched ? ` ${unmatched} mandate${unmatched === 1 ? "" : "s"} had no match; ${result.outreachCandidates?.length ?? 0} previous buyer contacts are available for approval-based outreach.` : ""}`);
      setShowMessage(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not scan for matches.");
    } finally {
      setMatching(false);
    }
  }

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className="flex justify-between"><p className={styles.eyebrow}>Private intake</p><h1>Seller mandates</h1><p className={styles.description}>Review submitted seller information, consent, attachments and matching actions from the live database.</p></div>
        <div className="flex flex-col gap-2 justify-between"><button className={styles.primary} type="button" disabled={matching} onClick={() => runMatching("all")}>{matching ? "Scanning..." : "Match all buyers"}</button><a className={styles.primary} href="/mandate">+ New mandate</a></div>
      </header>
      <section className={styles.panel}>
        <div className={styles.toolbar}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search seller, mandate or ID" aria-label="Search seller mandates" /><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter mandates by status"><option value="all">All statuses</option>{statuses.map((item) => <option value={item} key={item}>{item.replace("_", " ")}</option>)}</select><span>{visible.length} records</span></div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        {message && showMessage && <div className={styles.matchToast} role="status"><span className={styles.matchToastIcon}>✓</span><div><strong>Matching complete</strong><p>{message}</p></div><button type="button" onClick={() => setShowMessage(false)} aria-label="Dismiss matching result">×</button></div>}
        <div className={styles.list}>{visible.map((record) => <article key={record.id}><button className={styles.refButton} type="button" onClick={() => openMandate(record)}>{record.id.slice(0, 8).toUpperCase()}</button><div><h2>{record.product}</h2><p>{record.assetType} · {record.location || "Location pending"} · {record.contactName || "Contact pending"}</p></div><a className={styles.matchLink} href={record.matchCount ? `/admin/matches?sellerMandateId=${record.id}` : `/admin/matching?sellerMandateId=${record.id}`}>{record.matchCount ? `Open matched · ${record.matchCount}` : "Find matches"}</a><select className={styles.rowSelect} value={record.status} disabled={busyId === record.id} onChange={(event) => updateStatus(record, event.target.value)} aria-label={`Update status for ${record.product}`}>{statuses.map((item) => <option value={item} key={item}>{item.replace("_", " ")}</option>)}</select><time>{new Date(record.createdAt).toLocaleDateString()}</time><button type="button" onClick={() => openMandate(record)}>Open ↗</button></article>)}</div>
        {!visible.length && <p className={styles.empty}>No seller mandates match these filters.</p>}
      </section>
      {selected && <div className={styles.modalBackdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-label="Seller mandate details"><div className={styles.modalHeader}><div><p className={styles.eyebrow}>Mandate record</p><h2>{selected.product}</h2></div><button type="button" onClick={() => setSelected(null)} aria-label="Close mandate details">×</button></div><div className={styles.detailGrid}><div><span>Asset type</span><strong>{selected.assetType}</strong></div><div><span>Location</span><strong>{selected.location || "Not provided"}</strong></div><div><span>Contact</span><strong>{selected.contactName || "Not provided"}</strong></div><div><span>Email</span><strong>{selected.contactEmail || "Not provided"}</strong></div><div><span>Phone</span><strong>{selected.contactPhone || "Not provided"}</strong></div><div><span>Verification</span><strong>{selected.verificationStatus}</strong></div><div className={styles.wide}><span>Terms</span><strong>{selected.terms || "Not provided"}</strong></div></div><div className={styles.modalActions}><button type="button" disabled={matching} onClick={() => runMatching("selected", selected)}>{matching ? "Scanning..." : "Match this mandate"}</button><select value={selected.status} disabled={busyId === selected.id} onChange={(event) => updateStatus(selected, event.target.value)} aria-label="Update selected mandate status">{statuses.map((item) => <option value={item} key={item}>{item.replace("_", " ")}</option>)}</select><button type="button" disabled={busyId === selected.id} onClick={() => publish(selected)}>Publish listing</button><button type="button" disabled={busyId === selected.id} onClick={() => remove(selected)}>Delete mandate</button></div>{publishedReference && <p className={styles.success}>Published as {publishedReference}.</p>}</section></div>}
    </main>
  );
}
