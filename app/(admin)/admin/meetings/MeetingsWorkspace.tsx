"use client";

import { useMemo, useState } from "react";
import styles from "./meetings.module.css";

type Meeting = { id: string; scheduledAt: string; timezone: string; durationMinutes: number; inviteToken: string; status: string; buyer?: { contactName: string | null; contactEmail: string | null; contactPhone?: string | null }; seller?: { product: string; contactName: string | null; contactEmail: string | null; contactPhone?: string | null } };

type Filter = "all" | "upcoming" | "past";

export default function MeetingsWorkspace({ initialMeetings }: { initialMeetings: Meeting[] }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [selected, setSelected] = useState<Meeting | null>(null);
  const now = Date.now();
  const visible = useMemo(() => initialMeetings.filter((meeting) => {
    const search = query.trim().toLowerCase();
    const text = `${meeting.buyer?.contactName ?? ""} ${meeting.buyer?.contactEmail ?? ""} ${meeting.seller?.product ?? ""} ${meeting.seller?.contactName ?? ""} ${meeting.status}`.toLowerCase();
    const past = new Date(meeting.scheduledAt).getTime() < now;
    return (!search || text.includes(search)) && (filter === "all" || (filter === "past" ? past : !past));
  }), [filter, initialMeetings, now, query]);

  return <main className={styles.page}><header className={styles.header}><div><p className={styles.eyebrow}>Deal coordination</p><h1>Meetings</h1><p className={styles.description}>Search every past and upcoming admin-mediated meeting, then open a record for its full participant and invite details.</p></div></header><section className={styles.panel}><div className={styles.toolbar}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search buyer, seller or status" aria-label="Search meetings" /><select value={filter} onChange={(event) => setFilter(event.target.value as Filter)} aria-label="Filter meetings"><option value="all">All meetings</option><option value="upcoming">Upcoming</option><option value="past">Past</option></select><span>{visible.length} meetings</span></div><div className={styles.list}>{visible.map((meeting) => <article className={styles.row} key={meeting.id}><div><strong>{meeting.seller?.product || "PrimeQuest opportunity"}</strong><small>{meeting.buyer?.contactName || "Buyer pending"} ↔ {meeting.seller?.contactName || "Seller pending"}</small></div><time>{new Date(meeting.scheduledAt).toLocaleString("en-NG", { timeZone: meeting.timezone })}<small>{meeting.timezone} · {meeting.durationMinutes} min</small></time><span className={styles.status}>{meeting.status}</span><button type="button" onClick={() => setSelected(meeting)}>View details ↗</button></article>)}</div>{!visible.length && <p className={styles.empty}>No meetings match this filter.</p>}</section>{selected && <div className={styles.backdrop} role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelected(null); }}><section className={styles.modal} role="dialog" aria-modal="true" aria-label="Meeting details"><header className={styles.modalHeader}><div><p className={styles.eyebrow}>Meeting record</p><h2>{selected.seller?.product || "PrimeQuest opportunity"}</h2><p>{new Date(selected.scheduledAt).toLocaleString("en-NG", { timeZone: selected.timezone })} · {selected.timezone} · {selected.durationMinutes} minutes</p></div><button type="button" onClick={() => setSelected(null)} aria-label="Close meeting details">×</button></header><div className={styles.detailGrid}><article><span>Buyer</span><h3>{selected.buyer?.contactName || "Contact pending"}</h3><p>{selected.buyer?.contactEmail || "No email"}</p><p>{selected.buyer?.contactPhone || "No phone"}</p></article><article><span>Seller / mandate</span><h3>{selected.seller?.contactName || "Contact pending"}</h3><p>{selected.seller?.product || "No mandate title"}</p><p>{selected.seller?.contactEmail || "No email"}</p><p>{selected.seller?.contactPhone || "No phone"}</p></article></div><div className={styles.inviteBox}><span>Invite link</span><a href={`/meeting/${selected.inviteToken}`} target="_blank" rel="noreferrer">/meeting/{selected.inviteToken} ↗</a><p>Status: {selected.status}. PrimeQuest remains the meeting coordinator.</p></div></section></div>}</main>;
}
