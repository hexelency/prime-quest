import { NextResponse } from "next/server";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";

export const runtime = "nodejs";

export async function GET() {
  if (!isPrismaConfigured()) return NextResponse.json({ notifications: [], database: "preview" });
  try {
    const prisma = requirePrisma();
    const [notifications, unreadCount] = await Promise.all([
      prisma.adminNotification.findMany({ orderBy: { createdAt: "desc" }, take: 100 }),
      prisma.adminNotification.count({ where: { readAt: null, kind: { in: ["buyer", "seller"] } } }),
    ]);
    return NextResponse.json({ notifications, unreadCount, database: "connected" });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load notifications." }, { status: 500 });
  }
}