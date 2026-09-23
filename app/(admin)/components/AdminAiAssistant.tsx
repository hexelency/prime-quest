"use client";

import { FormEvent, useEffect, useState } from "react";
import styles from "./admin-ai-assistant.module.css";

type Message = { role: "user" | "assistant"; content: string };
type Provider = "local" | "openai" | "ollama";

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
  const [provider, setProvider] = useState<Provider>("local");
  const suggestions = promptsForPath(pathname);

  useEffect(() => {
    const openAssistant = (event: Event) => {
      const detail = (event as CustomEvent<{ prompt?: string }>).detail;
      setOpen(true);
      if (detail?.prompt) setPrompt(detail.prompt);
    };

    const interceptMatchingAiLink = async (event: MouseEvent) => {
      if (!pathname.startsWith("/admin/matching")) return;
      const target = event.target instanceof Element ? event.target.closest("a[href='/admin/ai']") : null;
      if (!target) return;
      event.preventDefault();
      setOpen(true);
      setLoading(true);
      setError("");
      const params = new URLSearchParams(window.location.search);
      const buyerRequestId = params.get("buyerRequestId") || undefined;
      const sellerMandateId = params.get("sellerMandateId") || undefined;
      try {
        const response = await fetch("/api/admin/matching", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ scope: buyerRequestId || sellerMandateId ? "selected" : "all", buyerRequestId, sellerMandateId }) });
        const result = await response.json() as { error?: string; matches?: number; notificationsCreated?: number };
        if (!response.ok) throw new Error(result.error ?? "Could not run database matching.");
        setPrompt(`The database match completed for ${buyerRequestId ? `buyer request ${buyerRequestId}` : sellerMandateId ? `seller mandate ${sellerMandateId}` : "the current workspace"}: ${result.matches ?? 0} matches found and ${result.notificationsCreated ?? 0} review notifications created. Summarize the strongest counterparties, verification risks, and next actions requiring admin approval. Do not send messages, publish records, or create meetings automatically.`);
      } catch (reason) {
        setError(reason instanceof Error ? reason.message : "Could not run database matching.");
      } finally {
        setLoading(false);
      }
    };

    document.addEventListener("primequest:open-ai", openAssistant);
    document.addEventListener("click", interceptMatchingAiLink, true);
    return () => {
      document.removeEventListener("primequest:open-ai", openAssistant);
      document.removeEventListener("click", interceptMatchingAiLink, true);
    };
  }, [pathname]);

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
      const response = await fetch("/api/ai/chat", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ messages: nextMessages, provider, pageContext: pathname }) });
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
      <form onSubmit={sendMessage}><input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask about this workspace..." aria-label="Ask Operations AI" /><label className={styles.agentPicker}>Agent <select value={provider} onChange={(event) => setProvider(event.target.value as Provider)} aria-label="Choose AI agent"><option value="local">CHATBOT</option><option value="openai">OPENAI</option><option value="ollama">OLLAMA</option></select></label><button type="submit" disabled={loading || !prompt.trim()} aria-label="Send message">↗</button></form>
    </section>}
    <button className={styles.launcher} type="button" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-label={open ? "Close Operations AI" : "Open Operations AI"}><span>✦</span>{open ? "Close" : "AI"}</button>
  </div>;
}
