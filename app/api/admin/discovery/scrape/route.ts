import { NextResponse } from "next/server";
import { extractDiscoveryCandidate, validateDiscoveryUrl } from "@/lib/server/discovery";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json() as { urls?: unknown };
    if (!Array.isArray(body.urls) || !body.urls.length || body.urls.length > 20) return NextResponse.json({ error: "Send between 1 and 20 HTTPS URLs." }, { status: 400 });

    const candidates = [];
    const errors = [];
    for (const value of body.urls) {
      const validation = validateDiscoveryUrl(value);
      if (validation.error || !validation.url) { errors.push({ url: value, error: validation.error }); continue; }
      try {
        const response = await fetch(validation.url, { headers: { "User-Agent": "PrimeQuestResearchBot/1.0 (+contact)" }, signal: AbortSignal.timeout(10000), cache: "no-store" });
        const contentType = response.headers.get("content-type") ?? "";
        if (!response.ok || !contentType.includes("text/html")) { errors.push({ url: value, error: "Source did not return readable HTML." }); continue; }
        const html = (await response.text()).slice(0, 1_000_000);
        candidates.push(extractDiscoveryCandidate(validation.url, html));
      } catch { errors.push({ url: value, error: "Source could not be fetched." }); }
    }
    return NextResponse.json({ candidates, errors, next_step: "Review and map candidates to asset_listings before publishing." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not scrape sources." }, { status: 500 });
  }
}