import { NextResponse } from "next/server";
import sharp from "sharp";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(request: Request, context: RouteContext) {
  if (!isPrismaConfigured()) return new NextResponse("Database is not configured.", { status: 503 });
  try {
    const { id } = await context.params;
    const original = new URL(request.url).searchParams.get("original") === "1";
    const rows = await requirePrisma().$queryRawUnsafe<Array<{ content: Buffer; mimeType: string; fileName: string; previewContent: Buffer | null; previewMimeType: string | null }>>(
      "SELECT content, mime_type AS \"mimeType\", file_name AS \"fileName\", preview_content AS \"previewContent\", preview_mime_type AS \"previewMimeType\" FROM intake_attachments WHERE id = $1::uuid LIMIT 1", id,
    );
    const file = rows[0];
    if (!file) return new NextResponse("Attachment not found.", { status: 404 });
    let content = file.content;
    let mimeType = file.mimeType;
    if (!original && file.mimeType.startsWith("image/") && !file.previewContent) {
      content = await sharp(file.content).rotate().resize({ width: 640, height: 480, fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
      mimeType = "image/webp";
      await requirePrisma().$executeRawUnsafe("UPDATE intake_attachments SET preview_content = $1, preview_mime_type = $2, preview_file_size = $3 WHERE id = $4::uuid", content, mimeType, content.length, id);
    } else if (!original && file.previewContent) {
      content = file.previewContent;
      mimeType = file.previewMimeType ?? file.mimeType;
    }
    return new NextResponse(new Uint8Array(content), { headers: { "Content-Type": mimeType, "Content-Disposition": `inline; filename="${file.fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}"`, "Cache-Control": "public, max-age=86400, immutable", "X-Image-Variant": original ? "original" : "preview" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load attachment." }, { status: 500 });
  }
}
