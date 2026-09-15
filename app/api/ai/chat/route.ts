import { NextResponse } from "next/server";
import { insertIntoSupabase, isDatabaseConfigured, selectFromSupabase } from "@/lib/server/supabase";

type ChatMessage = { role: "user" | "assistant"; content: string };
type ChatRequest = { messages?: ChatMessage[]; threadId?: string };

type OpenAiResponse = { choices?: Array<{ message?: { content?: string } }> };

const systemPrompt = `You are PrimeQuest's internal trade intelligence assistant.

Your job is to help an administrator review buyer mandates, seller mandates, discovered leads, and potential matches using the supplied workspace context.

Trust rules:
- A lead with potential or discovered status is not a confirmed buyer or seller.
- Confirmed is not the same as verified.
- Never claim a company, product, title, vessel, document, mandate, price, or transaction is genuine unless the database context explicitly supports that statement.
- Explain uncertainty and recommend human review for verification, sanctions, legal, technical, financial, or regulatory questions.
- Do not invent missing records, sources, contacts, match scores, or documents.
- Treat AI discovery as research assistance. Do not independently approve outreach, publish inventory, or authorize a transaction.
- Be concise, practical, and identify the relevant record references when available.`;

async function loadContext() {
  if (!isDatabaseConfigured()) return { database: "not_configured", mandates: [], leads: [], matches: [] };

  const [mandates, leads, matches] = await Promise.all([
    selectFromSupabase("mandates", { status: "in.(new,under_review,active,matched)", order: "updated_at.desc", limit: "20" }),
    selectFromSupabase("leads", { status: "not.in.(rejected)", order: "created_at.desc", limit: "20" }),
    selectFromSupabase("matches", { order: "score.desc", limit: "20" }),
  ]);

  return { database: "connected", mandates, leads, matches };
}

function getAiConfig() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) return null;
  return {
    apiKey,
    baseUrl: (process.env.OPENAI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, ""),
    model: process.env.OPENAI_MODEL ?? "gpt-4o-mini",
  };
}

export async function POST(request: Request) {
  let body: ChatRequest;
  try {
    body = await request.json() as ChatRequest;
  } catch {
    return NextResponse.json({ error: "The request body must be valid JSON." }, { status: 400 });
  }

  const messages = Array.isArray(body.messages)
    ? body.messages.filter((message) => (message.role === "user" || message.role === "assistant") && typeof message.content === "string" && message.content.trim()).slice(-12)
    : [];
  const lastMessage = messages.at(-1);
  if (!lastMessage || lastMessage.role !== "user") {
    return NextResponse.json({ error: "Send a user message to begin." }, { status: 400 });
  }

  const aiConfig = getAiConfig();
  if (!aiConfig) {
    return NextResponse.json({ error: "AI is not configured. Add OPENAI_API_KEY to the server environment." }, { status: 503 });
  }

  try {
    const context = await loadContext();
    let threadId = body.threadId;
    if (isDatabaseConfigured() && !threadId) {
      const threads = await insertIntoSupabase("ai_threads", { title: "Trade intelligence session" });
      threadId = String(threads[0]?.id ?? "");
    }
    if (isDatabaseConfigured() && threadId) {
      await insertIntoSupabase("ai_messages", { thread_id: threadId, role: "user", content: lastMessage.content });
    }

    const response = await fetch(`${aiConfig.baseUrl}/chat/completions`, {
      method: "POST",
      headers: { Authorization: `Bearer ${aiConfig.apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: aiConfig.model,
        temperature: 0.2,
        messages: [
          { role: "system", content: `${systemPrompt}\n\nCURRENT DATABASE CONTEXT:\n${JSON.stringify(context)}` },
          ...messages,
        ],
      }),
    });

    if (!response.ok) {
      return NextResponse.json({ error: `The AI provider returned HTTP ${response.status}.` }, { status: 502 });
    }

    const result = await response.json() as OpenAiResponse;
    const message = result.choices?.[0]?.message?.content?.trim();
    if (!message) return NextResponse.json({ error: "The AI provider returned an empty response." }, { status: 502 });

    if (isDatabaseConfigured() && threadId) {
      await insertIntoSupabase("ai_messages", { thread_id: threadId, role: "assistant", content: message });
    }

    return NextResponse.json({ message, threadId: threadId || null, database: context.database });
  } catch (error) {
    console.error("AI chat request failed", error);
    return NextResponse.json({ error: "The AI request could not load workspace context." }, { status: 502 });
  }
}
