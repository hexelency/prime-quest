import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

type RouteContext = { params: Promise<{ id: string }> };
const statuses = ["new", "under_review", "active", "matched", "closed", "expired"] as const;

export async function PATCH(request: Request, context: RouteContext) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const { id } = await context.params;
    const body = await request.json() as { status?: string; verification_status?: string };
    if (!statuses.includes(body.status as typeof statuses[number]) && !body.verification_status) return NextResponse.json({ error: "A valid mandate update is required." }, { status: 400 });
    const mandate = await requirePrisma().mandate.update({ where: { id }, data: {
      ...(statuses.includes(body.status as typeof statuses[number]) ? { status: body.status as typeof statuses[number] } : {}),
      ...(body.verification_status ? { verificationStatus: body.verification_status as "potential" | "confirmed" | "under_review" | "verified" | "rejected" } : {}),
    } });
    return NextResponse.json({ mandate });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update mandate." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const { id } = await context.params;
    await requirePrisma().$executeRawUnsafe("DELETE FROM intake_attachments WHERE entity_type = $1 AND entity_id = $2::uuid", "mandate", id);
    const mandate = await requirePrisma().mandate.delete({ where: { id } });
    return NextResponse.json({ mandate });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete mandate." }, { status: 500 });
  }
}
