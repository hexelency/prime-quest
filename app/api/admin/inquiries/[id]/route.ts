import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

type RouteContext = { params: Promise<{ id: string }> };
const statuses = ["new", "reviewing", "matched", "closed"] as const;

export async function PATCH(request: Request, context: RouteContext) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const { id } = await context.params;
    const body = await request.json() as { status?: string };
    if (!statuses.includes(body.status as typeof statuses[number])) return NextResponse.json({ error: "Invalid inquiry status." }, { status: 400 });
    const prisma = requirePrisma();
    const inquiry = await prisma.buyerRequest.update({ where: { id }, data: { status: body.status } });
    if (body.status !== "new") await prisma.adminNotification.updateMany({ where: { entityId: id, kind: "buyer", readAt: null }, data: { readAt: new Date() } });
    return NextResponse.json({ inquiry });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not update inquiry." }, { status: 500 }); }
}

export async function DELETE(_request: Request, context: RouteContext) {
  if (!isPrismaConfigured()) return NextResponse.json({ error: "Database is not configured." }, { status: 503 });
  try {
    const { id } = await context.params;
    const inquiry = await requirePrisma().buyerRequest.delete({ where: { id } });
    return NextResponse.json({ inquiry });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Could not delete inquiry." }, { status: 500 }); }
}
