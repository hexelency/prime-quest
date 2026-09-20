"use client";

import { useMemo, useState } from "react";
import styles from "./meetings.module.css";

type Meeting = { id: string; scheduledAt: string; timezone: string; durationMinutes: number; inviteToken: string; status: string; buyer?: { contactName: string | null; contactEmail: string | null; contactPhone?: string | null }; seller?: { product: string; contactName: string | null; contactEmail: string | null; contactPhone?: string | null } };
type Filter = "all" | "upcoming" | "past";

export default function MeetingsWorkspace({ initialMeetings }: { initialMeetings: Meeting[] }) {
  const [meetings, setMeetings] = useState(initialMeetings);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Meeting | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const now = Date.now();
  const visible = useMemo(() => meetings.filter((meeting) => {
    const search = query.trim().toLowerCase();
    const text = `${meeting.buyer?.contactName ?? ""} ${meeting.buyer?.contactEmail ?? ""} ${meeting.seller?.product ?? ""} ${meeting.seller?.contactName ?? ""} ${meeting.status}`.toLowerCase();
    const past = new Date(meeting.scheduledAt).getTime() < now;
    return (!search || text.includes(search)) && (filter === "all" || (filter === "past" ? past : !past));
  }), [filter, meetings, now, query]);

  async function createMeetings() {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/meetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ createAll: true }) });
      const result = await response.json() as { created?: number; skipped?: number; error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not create meetings.");
      setNotice(`${result.created ?? 0} pending meeting${result.created === 1 ? "" : "s"} created. ${result.skipped ?? 0} existing match${result.skipped === 1 ? " was" : "es were"} skipped.`);
      window.location.reload();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not create meetings."); } finally { setBusy(false); }
  }

  async function sendLink(meeting: Meeting) {
    if (meeting.status === "sent" || meeting.status === "past") return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/meetings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meetingId: meeting.id }) });
      const result = await response.json() as { error?: string; meeting?: Meeting };
      if (!response.ok) throw new Error(result.error ?? "Could not send meeting link.");
      if (result.meeting) { setMeetings((current) => current.map((item) => item.id === meeting.id ? { ...item, ...result.meeting } : item)); setSelected({ ...meeting, ...result.meeting }); }
      setNotice("Meeting link delivery attempted for both contacts.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not send meeting link."); } finally { setBusy(false); }
  }

  async function markPast(meeting: Meeting) {
    if (meeting.status === "past") return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/meetings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meetingId: meeting.id, status: "past" }) });
      const result = await response.json() as { error?: string; meeting?: Meeting };
      if (!response.ok) throw new Error(result.error ?? "Could not mark meeting as past.");
      if (result.meeting) { setMeetings((current) => current.map((item) => item.id === meeting.id ? { ...item, ...result.meeting } : item)); setSelected({ ...meeting, ...result.meeting }); }
      setNotice("Meeting marked as past.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not mark meeting as past."); } finally { setBusy(false); }
  }

  async function deleteMeeting(meeting: Meeting) {
    if (!window.confirm("Delete this meeting record?")) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/admin/meetings", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ meetingId: meeting.id }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not delete meeting.");
      setMeetings((current) => current.filter((item) => item.id !== meeting.id)); setSelected(null); setNotice("Meeting deleted.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Could not delete meeting."); } finally { setBusy(false); }
  }

  return <main className={styles.page}><header className={styles.header}><div><p className={styles.eyebrow}>Deal coordination</p><h1>Meetings</h1><p className={styles.description}>Create pending meetings for every matched buyer and seller, then send links only when each record is ready.</p></div><button className={styles.primary} type="button" onClick={createMeetings} disabled={busy}>{busy ? "Working..." : "Create meetings"}</button></header>{(notice || error) && <p className={error ? styles.error : styles.notice} role="status">{error || notice}</p>}<section className={styles.panel}><div className={styles.toolbar}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search buyer, seller or status" aria-label="Search meetings" /><select value={filter} onChange={(event) => setFilter(event.target.value as Filter)} aria-label="Filter meetings"><option value="all">All meetings</option><option value="upcoming">Upcoming</option><option value="past">Past</option></select><span>{visible.length} meetings</span></div><div className={styles.list}>{visible.map((meeting) => <article className={styles.row} key={meeting.id}><div><strong>{meeting.seller?.product || "PrimeQuest opportunity"}</strong><small>{meeting.buyer?.contactName || "Buyer pending"} ↔ {meeting.seller?.contactName || "Seller pending"}</small></div><time>{new Date(meeting.scheduledAt).toLocaleString("en-NG", { timeZone: meeting.timezone })}<small>{meeting.timezone} · {meeting.durationMinutes} min</small></time><span className={styles.status}>{meeting.status}</span><button type="button" onClick={() => setSelected(meeting)}>View details ↗</button></article>)}</div>{!visible.length && <p className={styles.empty}>No meetings match this filter.</p>}</section>{selected && <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-label="Meeting details"><header className={styles.modalHeader}><div><p className={styles.eyebrow}>Meeting record</p><h2>{selected.seller?.product || "PrimeQuest opportunity"}</h2><p>{new Date(selected.scheduledAt).toLocaleString("en-NG", { timeZone: selected.timezone })}</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Close meeting details">×</button></header><div className={styles.detailGrid}><article><span>Buyer</span><h3>{selected.buyer?.contactName || "Contact pending"}</h3><p>{selected.buyer?.contactEmail || "No email"}</p><p>{selected.buyer?.contactPhone || "No phone"}</p></article><article><span>Seller / mandate</span><h3>{selected.seller?.contactName || "Contact pending"}</h3><p>{selected.seller?.product || "No mandate title"}</p><p>{selected.seller?.contactEmail || "No email"}</p><p>{selected.seller?.contactPhone || "No phone"}</p></article></div><div className={styles.inviteBox}><span>Invite link</span><a href={`/meeting/${selected.inviteToken}`} target="_blank" rel="noreferrer">/meeting/{selected.inviteToken} ↗</a><p>Status: {selected.status}. Link delivery is a separate admin action.</p></div><div className={styles.modalActions}>{selected.status === "pending" ? <button className={styles.sendButton} type="button" onClick={() => sendLink(selected)} disabled={busy}>{busy ? "Sending..." : "Send meeting link"}</button> : selected.status === "sent" ? <span className={styles.sentNotice}>Link already sent</span> : null}{selected.status !== "past" && <button className={styles.secondaryButton} type="button" onClick={() => markPast(selected)} disabled={busy}>{busy ? "Updating..." : "Mark as past"}</button>}<button className={styles.secondaryButton} type="button" onClick={() => deleteMeeting(selected)} disabled={busy}>Delete meeting</button><button className={styles.secondaryButton} type="button" onClick={() => setSelected(null)}>Close</button></div></section></div>}</main>;
}
