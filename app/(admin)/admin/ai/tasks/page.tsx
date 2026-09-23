"use client";

import { useEffect, useState } from "react";
import styles from "./tasks.module.css";

type AgentTask = { id: string; title: string; objective: string; status: string; approvalStatus: string; sourceUrls: unknown; steps: unknown; findings: unknown; createdAt: string };

export default function AgentTasksPage() {
  const [tasks, setTasks] = useState<AgentTask[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState("");

  async function loadTasks() {
    const response = await fetch("/api/admin/ai/tasks", { cache: "no-store" });
    const result = await response.json() as { tasks?: AgentTask[]; error?: string };
    if (!response.ok) throw new Error(result.error ?? "Could not load tasks.");
    setTasks(result.tasks ?? []);
  }

  useEffect(() => { loadTasks().catch((reason: Error) => setError(reason.message)); }, []);

  async function approve(id: string) {
    setBusy(id);
    setError("");
    try {
      const response = await fetch("/api/admin/ai/tasks", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, action: "approve-research" }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Could not approve task.");
      await loadTasks();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Could not approve task.");
    } finally {
      setBusy("");
    }
  }

  return <main className={styles.page}>
    <a className={styles.back} href="/admin/ai">← AI control center</a>
    <header><p className={styles.eyebrow}>Agent governance</p><h1>Research tasks<br /><em>awaiting review.</em></h1><p className={styles.lead}>Agents may research approved sources, but database writes, publishing, messages and meetings remain separate approval steps.</p></header>
    {error && <p className={styles.error} role="alert">{error}</p>}
    <section className={styles.list} aria-label="Agent tasks">
      {!tasks.length && <p className={styles.empty}>No agent tasks have been planned.</p>}
      {tasks.map((task) => <article className={styles.task} key={task.id}><div><p className={styles.taskStatus}>{task.approvalStatus} · {task.status}</p><h2>{task.title}</h2><p>{task.objective}</p><small>{new Date(task.createdAt).toLocaleString()} · {Array.isArray(task.sourceUrls) ? task.sourceUrls.length : 0} approved source(s)</small></div><div className={styles.actions}>{task.approvalStatus === "pending" ? <button type="button" onClick={() => approve(task.id)} disabled={busy === task.id}>{busy === task.id ? "Approving..." : "Approve research"}</button> : <span>Research approval recorded</span>}</div></article>)}
    </section>
  </main>;
}
