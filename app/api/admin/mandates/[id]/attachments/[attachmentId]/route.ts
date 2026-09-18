import { NextResponse } from "next/server";
import sharp from "sharp";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

type RouteContext = { params: Promise<{ id: string; attachmentId: string }> };

export const runtime = "nodejs";

export async function PATCH(request: Request, context: RouteContext) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const { id, attachmentId } = await context.params;
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "Choose an image file." }, { status: 400 });
    if (!file.type.startsWith("image/")) return NextResponse.json({ error: "Only image files can replace a listing image." }, { status: 400 });
    if (file.size > 10 * 1024 * 1024) return NextResponse.json({ error: "Images must be 10 MB or smaller." }, { status: 400 });
    const prisma = requirePrisma();
    const exists = await prisma.$queryRawUnsafe<Array<{ id: string }>>("SELECT id FROM intake_attachments WHERE id = $1::uuid AND entity_id = $2::uuid AND entity_type = 'mandate' LIMIT 1", attachmentId, id);
    if (!exists.length) return NextResponse.json({ error: "Attachment not found." }, { status: 404 });
    const content = Buffer.from(await file.arrayBuffer());
    const previewContent = await sharp(content).rotate().resize({ width: 640, height: 480, fit: "inside", withoutEnlargement: true }).webp({ quality: 72 }).toBuffer();
    await prisma.$executeRawUnsafe("UPDATE intake_attachments SET file_name = $1, mime_type = $2, file_size = $3, content = $4, preview_content = $5, preview_mime_type = $6, preview_file_size = $7 WHERE id = $8::uuid AND entity_id = $9::uuid", file.name, file.type, file.size, content, previewContent, "image/webp", previewContent.length, attachmentId, id);
    return NextResponse.json({ message: "Image updated." });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update image." }, { status: 500 });
  }
}
