import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { messages?: Array<{ role?: string; content?: string }> };
    const latest = body.messages?.filter((message) => message.role === "user").at(-1)?.content?.trim() ?? "";
    if (!latest) return NextResponse.json({ error: "Tell me what you need help with." }, { status: 400 });
    const seller = /sell|offer|have a|listing|mandate/i.test(latest);
    const message = seller
      ? "I can help shape that seller mandate. Please complete the consented PrimeQuest intake form so the team can review the offering and contact you: /request"
      : "I can help shape that buyer brief. Please complete the consented PrimeQuest intake form so the team can search internal inventory and approved public sources: /request";
    return NextResponse.json({ message });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "The AI guide is unavailable." }, { status: 500 });
  }
}