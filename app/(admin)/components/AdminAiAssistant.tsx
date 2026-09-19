"use client";

import { FormEvent, useState } from "react";
import styles from "./admin-ai-assistant.module.css";

type Message = { role: "user" | "assistant"; content: string };

function promptsForPath(pathname: string) {
  if (pathname.includes("mandates")) return ["Find buyer matches for these seller mandates", "Which mandates need verification?"];
  if (pathname.includes("inquiries")) return ["Find seller mandates matching these buyer inquiries", "Which buyers need human review?"];
  if (pathname.includes("leads")) return ["Which leads are closest to a qualified match?", "Summarize lead verification risks"];
  if (pathname.includes("listings")) return ["Show published verified listings", "Which listings need review?"];
  return ["Run a buyer and seller match scan", "Summarize verification risks in the pipeline"];
}

export default function AdminAiAssistant({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const suggestions = promptsForPath(pathname);

  async function sendMessage(event?: FormEvent) {
    event?.preventDefault();
    const content = prompt.trim();
    if (!content || loading) return;
    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setPrompt("");
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: nextMessages, provider: "local", pageContext: pathname }) });
      const result = await response.json() as { message?: string; error?: string };
      if (!response.ok) throw new Error(result.error ?? "The admin assistant is unavailable.");
      setMessages([...nextMessages, { role: "assistant", content: result.message ?? "No response returned." }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The admin assistant is unavailable.");
    } finally {
      setLoading(false);
    }
  }

  return <div className={styles.root}>
    {open && <section className={styles.panel} aria-label="Admin AI assistant">
      <header><div><strong>Operations AI</strong><span>{pathname.replace("/admin", "") || "overview"}</span></div><button type="button" onClick={() => setOpen(false)} aria-label="Close assistant">×</button></header>
      {!messages.length && <div className={styles.suggestions}>{suggestions.map((item) => <button type="button" key={item} onClick={() => setPrompt(item)}>{item}<span>↗</span></button>)}</div>}
      <div className={styles.messages}>{messages.map((message, index) => <div className={message.role === "user" ? styles.user : styles.assistant} key={`${message.role}-${index}`}><small>{message.role === "user" ? "You" : "Operations AI"}</small><p>{message.content}</p></div>)}{loading && <div className={styles.assistant}><small>Operations AI</small><p>Reading this workspace...</p></div>}</div>
      {error && <p className={styles.error}>{error}</p>}
      <form onSubmit={sendMessage}><input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask about this workspace..." aria-label="Ask Operations AI" /><button type="submit" disabled={loading || !prompt.trim()} aria-label="Send message">↗</button></form>
    </section>}
    <button className={styles.launcher} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close Operations AI" : "Open Operations AI"}><span>✦</span>{open ? "Close" : "AI"}</button>
  </div>;
}
