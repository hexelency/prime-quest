"use client";

import { useEffect, useMemo, useState } from "react";
import styles from "./leads.module.css";

type Lead = { id: string; company_name: string; kind: string; country?: string; website?: string; source_url?: string; source_summary?: string; confidence_score?: number; status: string; verification_status: string; risk_flags?: string[]; created_at: string };

const statusOptions = ["all", "discovered", "researched", "contacted", "interested", "registered", "rejected"];
const verificationOptions = ["all", "potential", "confirmed", "under_review", "verified", "rejected"];

function label(value: string) { return value.replaceAll("_", " "); }

export default function LeadsWorkspace() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [status, setStatus] = useState("all");
  const [verification, setVerification] = useState("all");
  const [selected, setSelected] = useState<Lead | null>(null);
  const [database, setDatabase] = useState("preview");
  const [error, setError] = useState("");

  useEffect(() => { fetch("/api/admin/leads").then(async (response) => { const result = await response.json() as { leads?: Lead[]; database?: string; error?: string }; if (!response.ok) throw new Error(result.error); setLeads(result.leads ?? []); setDatabase(result.database ?? "preview"); }).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : "Could not load leads.")); }, []);

  const filteredLeads = useMemo(() => leads.filter((lead) => {
    const normalized = query.trim().toLowerCase();
    return (!normalized || [lead.company_name, lead.country ?? "", lead.kind].some((value) => value.toLowerCase().includes(normalized))) && (kind === "all" || lead.kind === kind) && (status === "all" || lead.status === status) && (verification === "all" || lead.verification_status === verification);
  }), [kind, query, status, verification, leads]);

  const updateLead = async (id: string, update: { status?: string; verification_status?: string }) => {
    setError("");
    try {
      const response = await fetch("/api/admin/leads", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, ...update }) });
      const result = await response.json() as { lead?: Lead; error?: string };
      if (!response.ok) throw new Error(result.error);
      if (result.lead) setLeads((current) => current.map((lead) => lead.id === id ? result.lead as Lead : lead));
      if (selected?.id === id && result.lead) setSelected(result.lead);
    } catch (reason: unknown) { setError(reason instanceof Error ? reason.message : "Could not update the lead."); }
  };

  return <main className={styles.page}>
    <header className={styles.header}><div><a className={styles.back} href="/admin">← Operations desk</a><p className={styles.eyebrow}>AI discovery pipeline</p><h1>Lead <em>intelligence.</em></h1><p className={styles.lead}>Review public-source discoveries before they become confirmed counterparties or active mandates.</p></div><div className={styles.headerMeta}><span className={database === "connected" ? styles.connected : styles.previewDot} />{database === "connected" ? "Database connected" : "Preview records"}</div></header>
    <section className={styles.metrics}><div><span>Total leads</span><strong>{leads.length}</strong></div><div><span>Potential buyers</span><strong>{leads.filter((lead) => lead.kind === "buyer").length}</strong></div><div><span>Needs research</span><strong>{leads.filter((lead) => lead.status === "discovered").length}</strong></div><div><span>Confirmed</span><strong>{leads.filter((lead) => lead.verification_status === "confirmed" || lead.verification_status === "verified").length}</strong></div></section>
    <section className={styles.workspace}><div className={styles.toolbar}><div className={styles.searchWrap}><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search company, country or role" aria-label="Search leads" /></div><select value={kind} onChange={(event) => setKind(event.target.value)} aria-label="Filter by lead type"><option value="all">All roles</option><option value="buyer">Potential buyers</option><option value="seller">Potential sellers</option></select><select value={status} onChange={(event) => setStatus(event.target.value)} aria-label="Filter by pipeline status">{statusOptions.map((item) => <option key={item} value={item}>{item === "all" ? "All pipeline stages" : label(item)}</option>)}</select><select value={verification} onChange={(event) => setVerification(event.target.value)} aria-label="Filter by verification status">{verificationOptions.map((item) => <option key={item} value={item}>{item === "all" ? "All trust states" : label(item)}</option>)}</select></div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      <div className={styles.tableWrap}><table className={styles.leadTable}><thead><tr><th>Company</th><th>Role</th><th>Confidence</th><th>Pipeline</th><th>Trust state</th><th>Source</th><th /></tr></thead><tbody>{filteredLeads.map((lead) => <tr key={lead.id} onClick={() => setSelected(lead)}><td><strong>{lead.company_name}</strong><small>{lead.country ?? "Country not recorded"}</small></td><td><span className={lead.kind === "buyer" ? styles.buyer : styles.seller}>{lead.kind}</span></td><td><div className={styles.confidence}><strong>{lead.confidence_score ?? "--"}%</strong><span><i style={{ width: `${lead.confidence_score ?? 0}%` }} /></span></div></td><td><span className={styles.pipeline}>{label(lead.status)}</span></td><td><span className={`${styles.trust} ${styles[`trust_${lead.verification_status}`]}`}>{label(lead.verification_status)}</span></td><td>{lead.source_url ? <a href={lead.source_url} target="_blank" rel="noreferrer" onClick={(event) => event.stopPropagation()}>Open source ↗</a> : "--"}</td><td><button type="button" aria-label={`Open ${lead.company_name}`} onClick={(event) => { event.stopPropagation(); setSelected(lead); }}>•••</button></td></tr>)}</tbody></table></div>{!filteredLeads.length && <div className={styles.empty}>No leads match these filters.</div>}</section>
    {selected && <div className={styles.overlay} role="presentation" onClick={() => setSelected(null)}><aside className={styles.drawer} role="dialog" aria-modal="true" aria-label={`${selected.company_name} lead details`} onClick={(event) => event.stopPropagation()}><button className={styles.drawerClose} type="button" onClick={() => setSelected(null)} aria-label="Close lead details">×</button><p className={styles.eyebrow}>Lead profile</p><h2>{selected.company_name}</h2><span className={selected.kind === "buyer" ? styles.buyer : styles.seller}>{selected.kind} lead · {selected.country}</span><div className={styles.detailScore}><span>AI confidence</span><strong>{selected.confidence_score ?? "--"}%</strong></div><p className={styles.summary}>{selected.source_summary}</p><div className={styles.detailBlock}><span>Pipeline stage</span><select value={selected.status} onChange={(event) => updateLead(selected.id, { status: event.target.value })}>{statusOptions.filter((item) => item !== "all").map((item) => <option value={item} key={item}>{label(item)}</option>)}</select></div><div className={styles.detailBlock}><span>Trust state</span><select value={selected.verification_status} onChange={(event) => updateLead(selected.id, { verification_status: event.target.value })}>{verificationOptions.filter((item) => item !== "all").map((item) => <option value={item} key={item}>{label(item)}</option>)}</select></div><div className={styles.riskBlock}><span>Risk flags</span>{(selected.risk_flags ?? []).map((flag) => <p key={flag}>! {flag}</p>)}</div><p className={styles.trustNote}>Potential lead status means public signals only. Human confirmation and defined verification checks are required before this company is represented as an active counterparty.</p></aside></div>}
  </main>;
}
