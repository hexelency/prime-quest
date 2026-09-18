import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

type RouteContext = { params: Promise<{ id: string }> };

export const runtime = "nodejs";

export async function GET(_request: Request, context: RouteContext) {
  if (!isPrismaConfigured()) return new NextResponse("Database is not configured.", { status: 503 });
  try {
    const { id } = await context.params;
    const rows = await requirePrisma().$queryRawUnsafe<Array<{ content: Buffer; mimeType: string; fileName: string }>>(
      "SELECT content, mime_type AS \"mimeType\", file_name AS \"fileName\" FROM intake_attachments WHERE id = $1::uuid LIMIT 1", id,
    );
    const file = rows[0];
    if (!file) return new NextResponse("Attachment not found.", { status: 404 });
    return new NextResponse(new Uint8Array(file.content), { headers: { "Content-Type": file.mimeType, "Content-Disposition": `inline; filename="${file.fileName.replace(/[^a-zA-Z0-9._-]/g, "-")}"`, "Cache-Control": "public, max-age=3600" } });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load attachment." }, { status: 500 });
  }
}
