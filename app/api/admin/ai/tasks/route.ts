import { NextResponse } from "next/server";
import { approveAgentTask, listAgentTasks } from "@/lib/server/agent-tasks";

export const runtime = "nodejs";

export async function GET() {
  try {
    return NextResponse.json(await listAgentTasks());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not load agent tasks." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json() as { id?: string; action?: string };
    if (!body.id || body.action !== "approve-research") return NextResponse.json({ error: "Only research approval is available." }, { status: 400 });
    const result = await approveAgentTask(body.id);
    if ("error" in result) return NextResponse.json(result, { status: 400 });
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Could not approve agent task." }, { status: 500 });
  }
}
