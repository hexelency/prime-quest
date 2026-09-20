const privateHostnames = new Set(["localhost", "127.0.0.1", "::1", "0.0.0.0"]);

export function validateDiscoveryUrl(value: unknown) {
  if (typeof value !== "string") return { error: "A URL is required." };
  let url: URL;
  try { url = new URL(value); } catch { return { error: "Invalid URL." }; }
  if (url.protocol !== "https:") return { error: "Only HTTPS sources are allowed." };
  if (privateHostnames.has(url.hostname.toLowerCase()) || /^10\.|^127\.|^169\.254\.|^192\.168\.|^172\.(1[6-9]|2\d|3[0-1])\./.test(url.hostname)) return { error: "Private network sources are not allowed." };

  const allowedDomains = (process.env.SCRAPER_ALLOWED_DOMAINS ?? "").split(",").map((domain) => domain.trim().toLowerCase()).filter(Boolean);
  if (allowedDomains.length && !allowedDomains.some((domain) => url.hostname === domain || url.hostname.endsWith(`.${domain}`))) return { error: "This source domain is not allowlisted." };
  return { url };
}

export function extractDiscoveryCandidate(url: URL, html: string) {
  const meta = (key: string) => {
    const pattern = new RegExp(`<meta[^>]+(?:property|name)=["']${key}["'][^>]+content=["']([^"']*)["'][^>]*>`, "i");
    const reversePattern = new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${key}["'][^>]*>`, "i");
    return pattern.exec(html)?.[1] ?? reversePattern.exec(html)?.[1] ?? "";
  };
  const decode = (value: string) => value.replace(/&amp;/g, "&").replace(/&#x20a6;/gi, "NGN ").replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/\s+/g, " ").trim();
  const title = decode(meta("og:title") || meta("twitter:title") || html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] || "Opportunity discovered").slice(0, 180);
  const summary = decode(meta("og:description") || meta("twitter:description"));
  const imageUrl = meta("og:image") || meta("twitter:image");
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  return { title, source_url: url.toString(), source_platform: url.hostname, source_summary: (summary || text).slice(0, 1200), image_url: imageUrl || undefined, discovered_by: "ai_agent", fetched_at: new Date().toISOString() };
}