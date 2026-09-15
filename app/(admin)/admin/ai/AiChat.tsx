"use client";

import { FormEvent, useState } from "react";
import styles from "./ai-chat.module.css";

type ChatMessage = { role: "user" | "assistant"; content: string };

const starterPrompts = [
  "Which potential buyer leads need human review first?",
  "Find active mandates that could match EN590 supply.",
  "Summarize verification risks in the current pipeline.",
];

export default function AiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [threadId, setThreadId] = useState<string | undefined>();

  const sendMessage = async (event?: FormEvent) => {
    event?.preventDefault();
    const content = prompt.trim();
    if (!content || loading) return;

    const nextMessages = [...messages, { role: "user" as const, content }];
    setMessages(nextMessages);
    setPrompt("");
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages, threadId }),
      });
      const result = await response.json() as { message?: string; error?: string; threadId?: string | null };
      if (!response.ok) throw new Error(result.error ?? "The AI request failed.");
      if (result.threadId) setThreadId(result.threadId);
      setMessages([...nextMessages, { role: "assistant", content: result.message ?? "No response returned." }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The AI request failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className={styles.page}>
      <header className={styles.header}><div><a className={styles.backLink} href="/admin">← Operations desk</a><p className={styles.eyebrow}>AI control center</p><h1>Trade intelligence<br /><em>with context.</em></h1><p className={styles.lead}>Ask questions about mandates, discovered leads, verification status and potential matches. Every answer is grounded in the records available to the server.</p></div><div className={styles.status}><span /> Human review required</div></header>
      <section className={styles.chatShell} aria-label="Trade intelligence assistant">
        <div className={styles.chatHeader}><div><strong>PrimeQuest intelligence assistant</strong><span>Internal workspace · database context enabled</span></div><span className={styles.model}>LLM</span></div>
        <div className={styles.messages} aria-live="polite">
          {!messages.length && <div className={styles.emptyState}><div className={styles.emptyMark}>PQ</div><h2>What should we investigate?</h2><p>The assistant can summarize pipeline records and suggest human review actions. It cannot verify a company or approve a transaction on its own.</p><div className={styles.promptGrid}>{starterPrompts.map((item) => <button type="button" key={item} onClick={() => setPrompt(item)}>{item}<span>↗</span></button>)}</div></div>}
          {messages.map((message, index) => <div className={message.role === "user" ? styles.userMessage : styles.assistantMessage} key={`${message.role}-${index}`}><span className={styles.messageRole}>{message.role === "user" ? "You" : "PrimeQuest AI"}</span><p>{message.content}</p></div>)}
          {loading && <div className={styles.assistantMessage}><span className={styles.messageRole}>PrimeQuest AI</span><p className={styles.thinking}>Reading current workspace context...</p></div>}
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <form className={styles.composer} onSubmit={sendMessage}><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask about leads, mandates or potential matches..." rows={2} aria-label="Ask the trade intelligence assistant" /><button type="submit" disabled={loading || !prompt.trim()} aria-label="Send message">Send <span>↗</span></button></form>
        <p className={styles.disclaimer}>AI output is an internal research aid. Treat discovered companies as potential leads until they confirm interest and complete the defined verification process.</p>
      </section>
    </main>
  );
}
