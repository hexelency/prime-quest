import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

export const runtime = "nodejs";

export async function GET() {
  if (!isPrismaConfigured()) return NextResponse.json({ notifications: [], database: "preview" });
  try {
    const notifications = await requirePrisma().adminNotification.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
    return NextResponse.json({ notifications, database: "connected" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load notifications." }, { status: 500 });
  }
}