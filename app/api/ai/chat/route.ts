import { NextResponse } from "next/server";
import { buildPrimeQuestReply } from "@/lib/primequest-chatbot";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import { extractDiscoveryCandidate, validateDiscoveryUrl } from "@/lib/server/discovery";

export const runtime = "nodejs";

const SYSTEM_PROMPT = `You are the AI business assistant for PrimeQuest Oil and Properties Consultants.

Your primary responsibility is to accurately explain PrimeQuest's business, services, policies, opportunities and transaction process.
You must be professional, helpful, transparent and commercially aware.
You must never fabricate information.

When discussing a specific vessel, property, buyer, seller, mandate, price, document, affiliate, transaction or deal status, rely only on verified current information supplied by the PrimeQuest database, authorized administrators or official company sources.
If information is unavailable, state that it is unavailable and direct the user to PrimeQuest's official contact channels.

Official PrimeQuest contact details:
- WhatsApp: +234 803 812 8933
- Telephone: +234 803 659 8189
- Email: primequestoilandpropertyconsul@gmail.com
- Location: Asaba, Delta State, Nigeria

Core company description:
PrimeQuest Oil and Properties Consultants is a Nigerian-based oil, gas, marine, property and commercial asset consultancy headquartered in Asaba, Delta State. PrimeQuest connects genuine sellers, asset owners, buyers, investors and clients across vessels, oil and gas, land, real estate, building products, heavy-duty equipment, industrial assets and related commercial opportunities.

Operating philosophy: Real Mandates. Real Opportunities. Real Connections.

For applicable vessel and property transactions, PrimeQuest's established commission policy is 4%, payable by the seller alone; buyers do not pay the PrimeQuest 4% seller commission under this policy.

PrimeQuest's objective is to reduce unnecessary intermediary layers and provide a professional bridge between legitimate commercial principals.

Always ensure the answer distinguishes between categories PrimeQuest facilitates and current verified listings. Do not state that a specific asset is available unless it is in a verified current listing or mandate. If there is no validated live listing, say so clearly and route the user to PrimeQuest directly.`;

const FAQ_AGENT_RULES = `
Additional PrimeQuest FAQ rules:
- PrimeQuest is a consultancy and transaction facilitator; it does not automatically own every listed asset.
- A listing or AI match is an opportunity, not a guarantee of ownership, title, condition, availability, sale or completion.
- Never invent vessel ownership, property title, prices, availability, certifications, documents, buyer identities, seller identities, previous deals or completed transactions.
- Explain that vessels, properties, oil and gas products, equipment and mandates require appropriate human, legal, technical, financial, KYC and regulatory due diligence.
- Do not treat documents supplied by a third party as genuine without appropriate verification.
- Do not give binding legal advice. Exact commission, non-circumvention, payment triggers and remedies come from the applicable signed agreement and law.
- Do not tell a user to pay money merely because an opportunity is listed.
- AI may organize information, identify potential matches and draft communication, but cannot guarantee a match, verify ownership by itself, negotiate binding terms or replace qualified professionals.
- Protect confidential information and share it only under authorization, applicable agreements, legitimate business need and law.
- PrimeQuest contact: Summit By Express, Asaba, Delta State, Nigeria; primequestoilandpropertyconsul@gmail.com; WhatsApp +234 803 812 8933; telephone +234 803 659 8189.`;

type AiDataTool = "buyer-count" | "buyer-review" | "mandate-search" | "listing-search" | "buyer-request-search" | "verification-risks" | "admin-notifications" | "web-discovery";

function selectAiDataTool(prompt: string, conversation = ""): AiDataTool | null {
  const text = prompt.toLowerCase();
  const directTool = selectAiDataToolFromText(text);
  if (directTool) return directTool;
  if (!/list|show|them|those|all together|how many|count|number/i.test(text)) return null;
  return selectAiDataToolFromText(conversation.toLowerCase());
}

function selectAiDataToolFromText(text: string): AiDataTool | null {
  if (/verification risk|verification risks|risk.*pipeline|pipeline.*risk/i.test(text)) return "verification-risks";
  if (/human review|review first|buyer lead|potential buyer/i.test(text)) return "buyer-review";
  if (/how many|count|number/i.test(text) && /buyer/i.test(text)) return "buyer-count";
  if (/mandate|seller|sell|en590|diesel/i.test(text)) return "mandate-search";
  if (/listing|asset|published opportunity/i.test(text)) return "listing-search";
  if (/buyer request|buyer requirement|inquir|request/i.test(text)) return "buyer-request-search";
  if (/notification|review queue|admin alert/i.test(text)) return "admin-notifications";
  if (/search the web|search online|web search|find.*vessel|vessel.*lead|vessel.*opportunit/i.test(text)) return "web-discovery";
  if (/search the web|search online|web search|find.*vessel|vessel.*lead|vessel.*opportunit/i.test(text)) return "web-discovery";
  return null;
}

async function askOpenAI(messages: Array<{ role: "user" | "assistant" | "system"; content: string }>) {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey || apiKey === "your-api-key" || apiKey === "your-openai-api-key") {
    return null;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      temperature: 0.3,
      messages,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    if (response.status === 429 && errorText.includes("credit_balance_exhausted")) {
      throw new Error("OpenAI has no API credits for the organization attached to this key. Add billing credits at https://platform.openai.com/settings/organization/billing/, then restart the server.");
    }
    throw new Error(`OpenAI request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json() as { choices?: Array<{ message?: { content?: string } }> };
  return data.choices?.[0]?.message?.content?.trim() || null;
}

async function buildAdminContext() {
  if (!isPrismaConfigured()) {
    return "Admin database context is not connected right now. Use PrimeQuest company policy and available public information only.";
  }

  try {
    const prisma = requirePrisma();
    const [buyerRequests, mandates, leads, listings] = await Promise.all([
      prisma.buyerRequest.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: {
        id: true, requestText: true, category: true, assetType: true, location: true, budget: true, status: true, createdAt: true,
      } }),
      prisma.mandate.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: {
        id: true, assetType: true, product: true, direction: true, status: true, verificationStatus: true, deliveryLocation: true, contactName: true, createdAt: true,
      } }),
      prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: {
        id: true, companyName: true, kind: true, country: true, status: true, verificationStatus: true, confidenceScore: true, createdAt: true,
      } }),
      prisma.assetListing.findMany({ orderBy: { createdAt: "desc" }, take: 8, select: {
        id: true, reference: true, title: true, category: true, assetType: true, location: true, status: true, verificationStatus: true, confidenceScore: true, createdAt: true,
      } }),
    ]);

    const formatList = (items: Array<Record<string, unknown>>, label: string) => {
      if (!items.length) return `${label}: none`;
      return `${label}:\n${items.map((item) => JSON.stringify(item)).join("\n")}`;
    };

    return [
      formatList(buyerRequests, "Recent buyer requests"),
      formatList(mandates, "Recent seller mandates"),
      formatList(leads, "Recent leads"),
      formatList(listings, "Recent asset listings"),
    ].join("\n\n");
  } catch {
    return "Admin database context could not be loaded. Use the PrimeQuest policy guide and ask the user to clarify a live record.";
  }
}

async function buildLiveMandateReply(prompt: string) {
  if (!isPrismaConfigured() || !/mandate|seller|sell/i.test(prompt)) return null;

  try {
    const prisma = requirePrisma();
    const unavailableStatuses: Array<"closed" | "expired"> = ["closed", "expired"];
    const availableWhere = { direction: "sell" as const, status: { notIn: unavailableStatuses } };
      const [count, confirmedCount, mandates] = await Promise.all([
        prisma.mandate.count({ where: availableWhere }),
      prisma.mandate.count({ where: { ...availableWhere, verificationStatus: "confirmed" } }),
      prisma.mandate.findMany({
        where: availableWhere,
        orderBy: { createdAt: "desc" },
        take: 50,
        select: { product: true, assetType: true, deliveryLocation: true, terms: true, status: true, verificationStatus: true },
      }),
    ]);

    const wantsConfirmed = /confirmed|verified/i.test(prompt);
    const wantsActive = /active/i.test(prompt);
    const wantsMatch = /match|supply|en590|diesel|product|find/i.test(prompt);
    if (!/how many|count|number|available|currently|active|confirmed|verified|match|find/i.test(prompt)) return null;

    if (wantsConfirmed) {
      return `There ${confirmedCount === 1 ? "is" : "are"} currently ${confirmedCount} confirmed seller mandate${confirmedCount === 1 ? "" : "s"} available in the PrimeQuest database.`;
    }

    if (!wantsActive && !wantsMatch && /how many|count|number|available|currently/i.test(prompt)) {
      return `There ${count === 1 ? "is" : "are"} currently ${count} available seller mandate${count === 1 ? "" : "s"} in the PrimeQuest database.`;
    }

    let results = mandates;
    if (wantsActive) results = results.filter((mandate) => mandate.status === "active");
    if (wantsMatch) {
      const searchTerms = /en590|diesel/i.test(prompt) ? ["en590", "diesel", "oil", "vessel", "petroleum"] : [];
      if (searchTerms.length) {
        results = results.filter((mandate) => searchTerms.some((term) => `${mandate.product} ${mandate.assetType} ${mandate.terms ?? ""}`.toLowerCase().includes(term)));
      }
    }

    if (!results.length) {
      return wantsMatch
        ? "I found no active seller mandate with EN590 or a clearly related oil or vessel description. The team should review the current under-review records before treating any as a match."
        : "There are currently no seller mandates matching those filters in the PrimeQuest database.";
    }

    const summary = results.slice(0, 10).map((mandate) => {
      const location = mandate.deliveryLocation ? ` in ${mandate.deliveryLocation}` : "";
      return `- ${mandate.product} (${mandate.assetType})${location}; status: ${mandate.status}; verification: ${mandate.verificationStatus}`;
    }).join("\n");
    const label = wantsMatch ? "potentially relevant active seller mandates" : "available seller mandates";
    return `I found ${results.length} ${label} in the PrimeQuest database. These are database matches, not a final commercial or technical verification.\n\n${summary}`;
  } catch {
    return null;
  }
}

async function buildLiveLeadReply(prompt: string) {
  if (!isPrismaConfigured() || !/lead|human review|review first/i.test(prompt)) return null;

  try {
    const prisma = requirePrisma();
    const leads = await prisma.lead.findMany({
      where: { kind: "buyer", status: { notIn: ["rejected"] }, verificationStatus: { in: ["potential", "under_review"] } },
      orderBy: [{ verificationStatus: "asc" }, { confidenceScore: "desc" }, { createdAt: "asc" }],
      take: 10,
      select: { companyName: true, country: true, status: true, verificationStatus: true, confidenceScore: true },
    });

    if (!leads.length) return "There are no potential buyer leads currently waiting for human review.";
    const summary = leads.map((lead, index) => {
      const location = lead.country ? `, ${lead.country}` : "";
      const score = lead.confidenceScore == null ? "unscored" : `${lead.confidenceScore}`;
      return `${index + 1}. ${lead.companyName}${location}; pipeline: ${lead.status}; verification: ${lead.verificationStatus}; confidence: ${score}`;
    }).join("\n");
    return `I found ${leads.length} potential buyer lead${leads.length === 1 ? "" : "s"} needing human review. Review these first because they are not yet confirmed:\n\n${summary}`;
  } catch {
    return null;
  }
}

async function buildLiveOperationsReply(prompt: string) {
  if (!isPrismaConfigured()) return null;

  try {
    const prisma = requirePrisma();
    if (/how many|count|number/i.test(prompt) && /buyer/i.test(prompt)) {
      const [buyerLeads, buyerRequests] = await Promise.all([
        prisma.lead.count({ where: { kind: "buyer", status: { notIn: ["rejected"] } } }),
        prisma.buyerRequest.count(),
      ]);
      return `PrimeQuest currently has ${buyerLeads} buyer lead${buyerLeads === 1 ? "" : "s"} and ${buyerRequests} buyer request${buyerRequests === 1 ? "" : "s"} in the database.`;
    }

    if (/verification risk|verification risks|risk|pipeline/i.test(prompt)) {
      const [mandates, leads, listings] = await Promise.all([
        prisma.mandate.findMany({ where: { verificationStatus: { notIn: ["confirmed", "verified"] }, status: { notIn: ["closed", "expired"] } }, select: { product: true, verificationStatus: true, status: true } }),
        prisma.lead.findMany({ where: { verificationStatus: { notIn: ["confirmed", "verified", "rejected"] }, status: { notIn: ["rejected"] } }, select: { companyName: true, verificationStatus: true, status: true } }),
        prisma.assetListing.findMany({ where: { verificationStatus: { notIn: ["confirmed", "verified", "rejected"] }, status: { notIn: ["withdrawn"] } }, select: { reference: true, title: true, verificationStatus: true, status: true } }),
      ]);
      const total = mandates.length + leads.length + listings.length;
      if (!total) return "No unresolved verification risks were found in the current pipeline.";
      const summary = [
        mandates.length ? `Seller mandates needing verification (${mandates.length}): ${mandates.slice(0, 5).map((item) => `${item.product} [${item.verificationStatus}]`).join(", ")}` : "",
        leads.length ? `Buyer or counterparty leads needing verification (${leads.length}): ${leads.slice(0, 5).map((item) => `${item.companyName} [${item.verificationStatus}]`).join(", ")}` : "",
        listings.length ? `Listings needing verification (${listings.length}): ${listings.slice(0, 5).map((item) => `${item.reference} ${item.title} [${item.verificationStatus}]`).join(", ")}` : "",
      ].filter(Boolean).join("\n");
      return `I found ${total} records with unresolved verification status. These should not be treated as verified opportunities yet.\n\n${summary}`;
    }

    if (/listing|asset|opportunit/i.test(prompt)) {
      const listings = await prisma.assetListing.findMany({
        where: { status: "published", verificationStatus: { in: ["confirmed", "verified"] } },
        orderBy: { publishedAt: "desc" },
        take: 10,
        select: { reference: true, title: true, assetType: true, location: true, summary: true, verificationStatus: true },
      });
      if (!listings.length) return "There are no published and verified marketplace listings available right now.";
      const summary = listings.map((listing) => `- ${listing.reference}: ${listing.title} (${listing.assetType})${listing.location ? ` in ${listing.location}` : ""}; verification: ${listing.verificationStatus}`).join("\n");
      return `I found ${listings.length} published and verified marketplace listing${listings.length === 1 ? "" : "s"}:\n\n${summary}`;
    }

    if (/buyer request|buyer requirement|inquir|request/i.test(prompt)) {
      const requests = await prisma.buyerRequest.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { requestText: true, assetType: true, location: true, budget: true, status: true } });
      if (!requests.length) return "There are no buyer requests in the PrimeQuest database.";
      const summary = requests.map((request) => `- ${request.requestText}${request.assetType ? `; asset: ${request.assetType}` : ""}${request.location ? `; location: ${request.location}` : ""}; status: ${request.status}`).join("\n");
      return `I found ${requests.length} recent buyer request${requests.length === 1 ? "" : "s"}:\n\n${summary}`;
    }

    if (/notification|review queue|admin alert/i.test(prompt)) {
      const notifications = await prisma.adminNotification.findMany({ orderBy: { createdAt: "desc" }, take: 10, select: { kind: true, subject: true, body: true, readAt: true } });
      if (!notifications.length) return "There are no admin notifications in the PrimeQuest database.";
      const summary = notifications.map((notification) => `- ${notification.subject} (${notification.kind})${notification.readAt ? "" : " [unread]"}: ${notification.body}`).join("\n");
      return `I found ${notifications.length} recent admin notification${notifications.length === 1 ? "" : "s"}:\n\n${summary}`;
    }
  } catch {
    return null;
  }

  return null;
}

async function buildWebDiscoveryReply() {
  const configuredSources = (process.env.DISCOVERY_SOURCE_URLS ?? "").split(",").map((value) => value.trim()).filter(Boolean).slice(0, 20);
  if (!configuredSources.length) {
    return "Web discovery is not configured yet. Add approved HTTPS vessel research URLs to DISCOVERY_SOURCE_URLS, or connect a search provider such as Brave Search or Tavily. Any result will remain an unverified lead until a human reviews it.";
  }

  const candidates: Array<{ title: string; source_url: string; source_platform: string; source_summary: string }> = [];
  for (const source of configuredSources) {
    const validation = validateDiscoveryUrl(source);
    if (validation.error || !validation.url) continue;
    try {
      const response = await fetch(validation.url, { headers: { "User-Agent": "PrimeQuestResearchBot/1.0 (+contact)" }, signal: AbortSignal.timeout(10000), cache: "no-store" });
      if (!response.ok || !(response.headers.get("content-type") ?? "").includes("text/html")) continue;
      const candidate = extractDiscoveryCandidate(validation.url, (await response.text()).slice(0, 1_000_000));
      if (/vessel|ship|marine|boat|tanker|barge|offshore|ahts|psv|tug/i.test(`${candidate.title} ${candidate.source_summary}`)) candidates.push(candidate);
    } catch {
      continue;
    }
  }

  if (!candidates.length) return "I checked the configured vessel research sources but found no readable vessel-related candidates. Any source result still requires human verification before it becomes a PrimeQuest lead or listing.";
  return `I found ${candidates.length} unverified vessel research candidate${candidates.length === 1 ? "" : "s"} from configured web sources. These are research leads, not confirmed mandates:\n\n${candidates.map((candidate) => `- ${candidate.title} (${candidate.source_platform})\n  Source: ${candidate.source_url}\n  ${candidate.source_summary}`).join("\n\n")}`;
}

async function persistThread(threadId: string | undefined, latestPrompt: string, reply: string) {
  if (!isPrismaConfigured()) return threadId;

  try {
    const prisma = requirePrisma();
    let activeThreadId = threadId;

    if (!activeThreadId) {
      const thread = await prisma.aiThread.create({ data: { title: latestPrompt.slice(0, 80) || "Trade intelligence session" } });
      activeThreadId = thread.id;
    }

    await prisma.aiMessage.create({ data: { threadId: activeThreadId, role: "user", content: latestPrompt } });
    await prisma.aiMessage.create({ data: { threadId: activeThreadId, role: "assistant", content: reply } });

    return activeThreadId;
  } catch {
    return threadId;
  }
}

export async function POST(request: Request) {
  let body: { messages?: Array<{ role?: string; content?: string }>; threadId?: string; provider?: "auto" | "openai" | "local"; pageContext?: string } = {};

  try {
    try {
      body = await request.json() as { messages?: Array<{ role?: string; content?: string }>; threadId?: string };
    } catch {
      body = {};
    }

    const messages = (body.messages ?? []).map((message) => ({
      role: (message.role === "assistant" || message.role === "system" ? message.role : "user") as "assistant" | "system" | "user",
      content: message.content ?? "",
    }));
    const latest = messages.filter((message) => message.role === "user").at(-1)?.content?.trim() ?? "";

    if (!latest) {
      return NextResponse.json({ error: "Tell me what you need help with." }, { status: 400 });
    }

    const provider = body.provider ?? "auto";
    const userConversation = messages.filter((message) => message.role === "user").map((message) => message.content).join("\n");
    const selectedTool = selectAiDataTool(latest, userConversation);
    const liveReply = selectedTool === "buyer-review"
      ? await buildLiveLeadReply(userConversation)
      : selectedTool === "mandate-search"
        ? await buildLiveMandateReply(userConversation)
        : selectedTool
          ? selectedTool === "web-discovery"
            ? await buildWebDiscoveryReply()
            : await buildLiveOperationsReply(userConversation)
          : null;
    if (liveReply) {
      const threadId = await persistThread(body.threadId, latest, liveReply);
      return NextResponse.json({ message: liveReply, model: "PrimeQuest live database", source: "admin-context", tool: selectedTool, threadId });
    }

    const adminContext = await buildAdminContext();
    const promptMessages = [
      { role: "system" as const, content: `${SYSTEM_PROMPT}\n${FAQ_AGENT_RULES}\n\nCURRENT ADMIN PAGE CONTEXT:\n${body.pageContext ?? "overview"}\n\nADMIN WORKSPACE CONTEXT:\n${adminContext}` },
      ...messages,
    ];

    const openAiResponse = provider === "local" ? null : await askOpenAI(promptMessages);
    if (provider === "openai" && !openAiResponse) {
      return NextResponse.json({ error: "OpenAI did not return a response. Check the API key, billing, model name, and server logs." }, { status: 502 });
    }
    const reply = openAiResponse ?? buildPrimeQuestReply(latest);
    const threadId = await persistThread(body.threadId, latest, reply);

    return NextResponse.json({
      message: reply,
      system_prompt: SYSTEM_PROMPT,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      source: openAiResponse ? "openai" : "local-knowledge",
      threadId,
    });
  } catch (error) {
    if (body.provider === "openai") {
      return NextResponse.json({
        error: error instanceof Error ? error.message : "The OpenAI request failed.",
      }, { status: 502 });
    }

    const fallbackPrompt = (body.messages ?? []).filter((message) => message.role === "user").at(-1)?.content?.trim() ?? "";
    const fallbackMessage = buildPrimeQuestReply(fallbackPrompt);

    return NextResponse.json({
      message: fallbackMessage,
      system_prompt: SYSTEM_PROMPT,
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      source: "local-knowledge",
      error: error instanceof Error ? error.message : "The AI guide is unavailable.",
    }, { status: 200 });
  }
}