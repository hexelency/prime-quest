import { extractDiscoveryCandidate, validateDiscoveryUrl } from "@/lib/server/discovery";
import { isPrismaConfigured, requirePrisma } from "@/lib/server/prisma";
import type { Prisma } from "@/generated/prisma";

type AgentStep = {
  id: string;
  title: string;
  status: "pending" | "complete";
  approvalRequired: boolean;
};

const defaultSteps: AgentStep[] = [
  { id: "research", title: "Search the approved web sources", status: "pending", approvalRequired: false },
  { id: "review", title: "Review and classify discovered buyer or seller candidates", status: "pending", approvalRequired: true },
  { id: "database", title: "Approve saving candidates as unverified database records", status: "pending", approvalRequired: true },
  { id: "notify", title: "Approve the admin summary and any WhatsApp messages", status: "pending", approvalRequired: true },
  { id: "meetings", title: "Approve conflict-checked meeting invitations for matched parties", status: "pending", approvalRequired: true },
];

function listFromJson(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function validateSources(sourceUrls: string[]) {
  return sourceUrls.map((source) => ({ source, error: validateDiscoveryUrl(source).error })).filter((item) => item.error);
}

export async function createAgentTask(input: { objective: string; keywords?: string[]; sourceUrls?: string[] }) {
  if (!isPrismaConfigured()) return { error: "The task database is not connected." };
  const sourceUrls = input.sourceUrls?.length ? input.sourceUrls : (process.env.DISCOVERY_SOURCE_URLS ?? "").split(",").map((value) => value.trim()).filter(Boolean);
  const invalidSources = validateSources(sourceUrls);
  if (invalidSources.length) return { error: `Sources must be approved HTTPS allowlisted URLs: ${invalidSources.map((item) => item.source).join(", ")}` };

  const task = await requirePrisma().agentTask.create({
    data: { title: input.objective.slice(0, 120), objective: input.objective, keywords: input.keywords ?? [], sourceUrls, steps: defaultSteps, findings: [] },
  });
  return { task };
}

export async function getAgentTask(id: string) {
  if (!isPrismaConfigured()) return { error: "The task database is not connected." };
  const task = await requirePrisma().agentTask.findUnique({ where: { id } });
  return task ? { task } : { error: "Agent task not found." };
}

export async function listAgentTasks() {
  if (!isPrismaConfigured()) return { tasks: [], database: "preview" };
  const tasks = await requirePrisma().agentTask.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  return { tasks, database: "connected" };
}

export async function approveAgentTask(id: string) {
  if (!isPrismaConfigured()) return { error: "The task database is not connected." };
  const result = await requirePrisma().agentTask.updateMany({ where: { id, approvalStatus: "pending", status: "awaiting_approval" }, data: { approvalStatus: "approved", status: "approved_for_research" } });
  return result.count ? getAgentTask(id) : { error: "Task is missing or has already been approved." };
}

export async function runAgentTaskResearch(id: string) {
  if (!isPrismaConfigured()) return { error: "The task database is not connected." };
  const prisma = requirePrisma();
  const task = await prisma.agentTask.findUnique({ where: { id } });
  if (!task) return { error: "Agent task not found." };
  if (task.approvalStatus !== "approved") return { error: "Admin approval is required before research can run." };

  const candidates: Array<Record<string, unknown>> = [];
  const errors: Array<{ url: string; error: string }> = [];
  for (const source of listFromJson(task.sourceUrls).slice(0, 20)) {
    const validation = validateDiscoveryUrl(source);
    if (validation.error || !validation.url) { errors.push({ url: source, error: validation.error ?? "Invalid source." }); continue; }
    try {
      const response = await fetch(source, { signal: AbortSignal.timeout(10000), headers: { Accept: "text/html,application/xhtml+xml" } });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      candidates.push(extractDiscoveryCandidate(validation.url, (await response.text()).slice(0, 1_000_000)));
    } catch (error) {
      errors.push({ url: source, error: error instanceof Error ? error.message : "Could not fetch source." });
    }
  }

  const steps = defaultSteps.map((step) => step.id === "research" ? { ...step, status: "complete" as const } : step);
  const findings = { candidates, errors } as Prisma.InputJsonValue;
  const updated = await prisma.agentTask.update({ where: { id }, data: { status: "research_complete", steps, findings } });
  return { task: updated, candidates, errors, nextStep: "Admin review is required before any database write, notification, WhatsApp message, publication, or meeting invitation." };
}
