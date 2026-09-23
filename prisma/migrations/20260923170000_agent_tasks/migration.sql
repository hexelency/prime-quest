CREATE TABLE "agent_tasks" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "objective" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'awaiting_approval',
    "approval_status" TEXT NOT NULL DEFAULT 'pending',
    "keywords" JSONB NOT NULL DEFAULT '[]',
    "source_urls" JSONB NOT NULL DEFAULT '[]',
    "steps" JSONB NOT NULL DEFAULT '[]',
    "findings" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "agent_tasks_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "agent_tasks_status_approval_status_created_at_idx" ON "agent_tasks"("status", "approval_status", "created_at");
