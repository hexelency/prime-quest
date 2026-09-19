"use client";

import { FormEvent, useState } from "react";
import styles from "./ai-chat.module.css";

type AiDataTool = "buyer-count" | "buyer-review" | "mandate-search" | "listing-search" | "buyer-request-search" | "verification-risks" | "admin-notifications" | "web-discovery";
type ChatMessage = { role: "user" | "assistant"; content: string; source?: "openai" | "local-knowledge" | "admin-context"; tool?: AiDataTool };
type Provider = "auto" | "openai" | "local";

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
  const [provider, setProvider] = useState<Provider>("auto");

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
        body: JSON.stringify({ messages: nextMessages, threadId, provider }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) as { message?: string; error?: string; threadId?: string | null; source?: "openai" | "local-knowledge" | "admin-context"; tool?: AiDataTool } : {} as { message?: string; error?: string; threadId?: string | null; source?: "openai" | "local-knowledge" | "admin-context"; tool?: AiDataTool };
      if (!response.ok) throw new Error(result.error ?? "The AI request failed.");
      if (result.threadId) setThreadId(result.threadId);
      setMessages([...nextMessages, { role: "assistant", content: result.message ?? "No response returned.", source: result.source ?? "local-knowledge", tool: result.tool }]);
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
        <div className={styles.chatHeader}><div><strong>PrimeQuest intelligence assistant</strong><span>Internal workspace · database context enabled</span></div><label className={styles.model}>Agent <select value={provider} onChange={(event) => setProvider(event.target.value as Provider)} aria-label="Choose AI agent"><option value="auto">Auto</option><option value="openai">OpenAI</option><option value="local">PrimeQuest knowledge</option></select></label></div>
        <div className={styles.messages} aria-live="polite">
          {!messages.length && <div className={styles.emptyState}><div className={styles.emptyMark}>PQ</div><h2>What should we investigate?</h2><p>The assistant can summarize pipeline records and suggest human review actions. It cannot verify a company or approve a transaction on its own.</p><div className={styles.promptGrid}>{starterPrompts.map((item) => <button type="button" key={item} onClick={() => setPrompt(item)}>{item}<span>↗</span></button>)}</div></div>}
          {messages.map((message, index) => <div className={message.role === "user" ? styles.userMessage : styles.assistantMessage} key={`${message.role}-${index}`}><span className={styles.messageRole}>{message.role === "user" ? "You" : "PrimeQuest AI"}</span>{message.role === "assistant" && message.source && <small className={styles.sourceTag}>{message.source === "openai" ? "OpenAI" : message.source === "admin-context" ? `Live data${message.tool ? ` · ${message.tool}` : ""}` : "PrimeQuest knowledge"}</small>}<p>{message.content}</p></div>)}
          {loading && <div className={styles.assistantMessage}><span className={styles.messageRole}>PrimeQuest AI</span><p className={styles.thinking}>Reading current workspace context...</p></div>}
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <form className={styles.composer} onSubmit={sendMessage}><textarea value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask about leads, mandates or potential matches..." rows={2} aria-label="Ask the trade intelligence assistant" /><button type="submit" disabled={loading || !prompt.trim()} aria-label="Send message">Send <span>↗</span></button></form>
        <p className={styles.disclaimer}>AI output is an internal research aid. Treat discovered companies as potential leads until they confirm interest and complete the defined verification process.</p>
      </section>
    </main>
  );
}
