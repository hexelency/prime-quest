import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import { answerBuyerSellerQuestion, searchSellerMandates, searchVerifiedListings } from "@/lib/server/primequest-tools";
import { approveAgentTask, createAgentTask, getAgentTask, runAgentTaskResearch } from "@/lib/server/agent-tasks";

const handler = createMcpHandler(
    (server) => {
        server.registerTool(
            "BuyerSellerQnA",
            {
                title: "Buyer and Seller Q&A",
                description:
                    "Answer general questions about PrimeQuest buyer and seller workflows.",
                inputSchema: {
                    question: z.string().min(1),
                },
            },
            async ({ question }) => ({
                content: [{
                    type: "text",
                    text: (await answerBuyerSellerQuestion(question)) ?? `PrimeQuest buyer and seller workflows are handled through verified intake, mandate matching, scheduled meetings, and deal management. Your question was: ${question}`,
                }],
            }),
        );

        server.registerTool(
            "SearchVerifiedListings",
            {
                title: "Search Verified Listings",
                description: "Find currently published and verified PrimeQuest marketplace listings.",
                inputSchema: {
                    query: z.string().optional(),
                },
            },
            async ({ query }) => ({
                content: [{ type: "text", text: (await searchVerifiedListings(query)) ?? "The listing database is not connected right now." }],
            }),
        );

        server.registerTool(
            "SearchSellerMandates",
            {
                title: "Search Seller Mandates",
                description: "Find active PrimeQuest seller mandates matching a product, asset type, or location.",
                inputSchema: {
                    query: z.string().optional(),
                },
            },
            async ({ query }) => ({
                content: [{ type: "text", text: (await searchSellerMandates(query)) ?? "The mandate database is not connected right now." }],
            }),
        );

        server.registerTool(
            "PlanAgentTask",
            {
                title: "Plan Agent Task",
                description: "Create an approval-gated research and operations plan using only approved web sources. This does not contact people or change published records.",
                inputSchema: {
                    objective: z.string().min(10),
                    keywords: z.array(z.string()).optional(),
                    sourceUrls: z.array(z.string().url()).optional(),
                },
            },
            async ({ objective, keywords, sourceUrls }) => ({ content: [{ type: "text", text: JSON.stringify(await createAgentTask({ objective, keywords, sourceUrls })) }] }),
        );

        server.registerTool(
            "GetAgentTask",
            {
                title: "Get Agent Task",
                description: "Read an agent task, its approval state, steps, and research findings.",
                inputSchema: { taskId: z.string().uuid() },
            },
            async ({ taskId }) => ({ content: [{ type: "text", text: JSON.stringify(await getAgentTask(taskId)) }] }),
        );

        server.registerTool(
            "ApproveAgentTask",
            {
                title: "Approve Agent Task",
                description: "Approve only the research phase. This does not approve database writes, messages, publishing, or meetings.",
                inputSchema: { taskId: z.string().uuid() },
            },
            async ({ taskId }) => ({ content: [{ type: "text", text: JSON.stringify(await approveAgentTask(taskId)) }] }),
        );

        server.registerTool(
            "RunApprovedAgentResearch",
            {
                title: "Run Approved Agent Research",
                description: "Fetch approved HTTPS allowlisted sources and save unverified findings for admin review.",
                inputSchema: { taskId: z.string().uuid() },
            },
            async ({ taskId }) => ({ content: [{ type: "text", text: JSON.stringify(await runAgentTaskResearch(taskId)) }] }),
        );

    },
    {
        capabilities: {
            tools: {},
        },
    },
    {
        redisUrl: process.env.REDIS_URL,
        basePath: "/api",
        maxDuration: 60,
        verboseLogs: true,
    },
);

export { handler as GET, handler as POST };