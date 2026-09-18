import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

type RouteContext = { params: Promise<{ id: string }> };
const categories = ["vessel", "property", "land", "track_farm", "energy"] as const;

function text(value: unknown, fallback = "") { return typeof value === "string" ? value.trim().slice(0, 500) : fallback; }

export async function POST(request: Request, context: RouteContext) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const { id } = await context.params;
    const body = await request.json() as { reference?: unknown; title?: unknown; category?: unknown; tags?: unknown; image_attachment_id?: unknown };
    const prisma = requirePrisma();
    const mandate = await prisma.mandate.findUnique({ where: { id } });
    if (!mandate || mandate.direction !== "sell") return NextResponse.json({ error: "Seller mandate was not found." }, { status: 404 });
    const reference = text(body.reference) || `M-${id.slice(0, 8).toUpperCase()}`;
    const title = text(body.title) || mandate.product;
    const category = categories.includes(body.category as typeof categories[number]) ? body.category as typeof categories[number] : "energy";
    const tags = Array.isArray(body.tags) ? body.tags.filter((tag): tag is string => typeof tag === "string" && Boolean(tag.trim())).map((tag) => tag.trim().slice(0, 80)).slice(0, 20) : [];
    let imageUrl: string | undefined;
    const requestedAttachment = text(body.image_attachment_id);
    const attachments = await prisma.$queryRawUnsafe<Array<{ id: string; fileName: string; mimeType: string }>>(
      "SELECT id, file_name AS \"fileName\", mime_type AS \"mimeType\" FROM intake_attachments WHERE entity_type = 'mandate' AND entity_id = $1::uuid ORDER BY created_at ASC", id,
    );
    const image = attachments.find((attachment) => attachment.id === requestedAttachment) ?? attachments.find((attachment) => attachment.mimeType.startsWith("image/"));
    if (image) imageUrl = `/api/mandates/attachments/${image.id}`;
    const listing = await prisma.assetListing.create({ data: {
      reference, title, category, assetType: mandate.assetType, location: mandate.deliveryLocation, summary: mandate.product,
      imageUrl, tags, discoveredBy: "seller_mandate", status: "published", verificationStatus: "confirmed", publishedAt: new Date(),
      sourceSummary: `Published from seller mandate ${id}.`, confidenceScore: 100,
    } });
    const updated = await prisma.mandate.update({ where: { id }, data: { status: "active", verificationStatus: "confirmed" } });
    return NextResponse.json({ listing: { id: listing.id, reference: listing.reference, title: listing.title, tags: listing.tags }, mandate: updated }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not publish mandate." }, { status: 500 });
  }
}
