"use client";

import { FormEvent, useState } from "react";
import styles from "./prime-quest-chat.module.css";

type ChatMessage = { role: "user" | "assistant"; content: string };

type ApiResponse = { message?: string; error?: string };

const starterPrompts = [
  "I want to buy a vessel",
  "I have a property to sell",
  "How does verification work?",
];

const welcomeMessage = "Hello. I am the PrimeQuest guide. I can help you find the right path, shape a buyer requirement, or understand how opportunities move through review and verification.";

export default function PrimeQuestChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

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
        body: JSON.stringify({ messages: nextMessages }),
      });

      const text = await response.text();
      const result = text ? JSON.parse(text) as ApiResponse : {} as ApiResponse;
      if (!response.ok) throw new Error(result.error ?? "The guide is unavailable right now.");
      setMessages([...nextMessages, { role: "assistant", content: result.message ?? "Please contact the PrimeQuest team for assistance." }]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The guide is unavailable right now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.widget}>
      {isOpen && <section className={styles.panel} aria-label="PrimeQuest AI guide">
        <header className={styles.panelHeader}>
          <div className={styles.identity}><span className={styles.mark}>PQ</span><div><strong>PrimeQuest guide</strong><span>AI-assisted orientation</span></div></div>
          <button className={styles.closeButton} type="button" onClick={() => setIsOpen(false)} aria-label="Close PrimeQuest guide">×</button>
        </header>
        <div className={styles.messages} aria-live="polite">
          <div className={styles.assistantMessage}><span className={styles.messageLabel}>PrimeQuest AI</span><p>{welcomeMessage}</p></div>
          {messages.map((message, index) => <div className={message.role === "user" ? styles.userMessage : styles.assistantMessage} key={`${message.role}-${index}`}><span className={styles.messageLabel}>{message.role === "user" ? "You" : "PrimeQuest AI"}</span><p>{message.content}</p></div>)}
          {loading && <div className={styles.assistantMessage}><span className={styles.messageLabel}>PrimeQuest AI</span><p className={styles.thinking}>Thinking...</p></div>}
          {!messages.length && <div className={styles.quickPrompts}>{starterPrompts.map((item) => <button type="button" key={item} onClick={() => setPrompt(item)}>{item}<span>↗</span></button>)}</div>}
        </div>
        {error && <p className={styles.error} role="alert">{error}</p>}
        <form className={styles.composer} onSubmit={sendMessage}><input value={prompt} onChange={(event) => setPrompt(event.target.value)} placeholder="Ask PrimeQuest..." aria-label="Ask PrimeQuest" /><button type="submit" disabled={loading || !prompt.trim()} aria-label="Send message">↗</button></form>
        <p className={styles.disclaimer}>AI guidance is informational. Opportunities remain subject to human review and due diligence.</p>
      </section>}
      <button className={`${styles.launcher} ${isOpen ? styles.launcherOpen : ""}`} type="button" onClick={() => setIsOpen((open) => !open)} aria-expanded={isOpen} aria-label={isOpen ? "Close PrimeQuest guide" : "Open PrimeQuest guide"}><span className={styles.launcherIcon}>{isOpen ? "×" : "✦"}</span><span>{isOpen ? "Close" : "Ask PrimeQuest"}</span></button>
    </div>
  );
}
