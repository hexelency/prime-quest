"use client";

import { useMemo, useState } from "react";
import styles from "./admin-records.module.css";

type RecordPageProps = { eyebrow: string; title: string; description: string; records: Array<{ ref: string; title: string; detail: string; status: string; date: string }> };

export default function AdminRecordsPage({ eyebrow, title, description, records }: RecordPageProps) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const visibleRecords = useMemo(() => records.filter((record) => (!query.trim() || `${record.ref} ${record.title} ${record.detail}`.toLowerCase().includes(query.trim().toLowerCase())) && (status === "all" || record.status === status)), [query, records, status]);
  const statuses = Array.from(new Set(records.map((record) => record.status)));

  return <main className={styles.page}><header className={styles.header}><div><p className={styles.eyebrow}>{eyebrow}</p><h1>{title}</h1><p className={styles.description}>{description}</p></div><button className={styles.primary} type="button">+ New record</button></header><section className={styles.panel}><div className={styles.toolbar}><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" aria-label={`Search ${title}`} /><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label={`Filter ${title} by status`}><option value="all">All statuses</option>{statuses.map((item) => <option value={item} key={item}>{item}</option>)}</select><span>{visibleRecords.length} records</span></div><div className={styles.list}>{visibleRecords.map((record) => <article key={record.ref}><span className={styles.ref}>{record.ref}</span><div><h2>{record.title}</h2><p>{record.detail}</p></div><span className={styles.status}>{record.status}</span><time>{record.date}</time><button type="button" aria-label={`Open ${record.title}`}>Open ↗</button></article>)}</div>{!visibleRecords.length && <p className={styles.empty}>No records match the current filters.</p>}</section></main>;
}
