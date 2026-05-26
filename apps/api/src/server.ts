import cors from "@fastify/cors";
import Fastify from "fastify";
import { z } from "zod";
import {
  applyBuilderIntelligenceResult,
  applyBuilderMessage,
  applyMerchantMessage,
  createInitialAgentBuilderDraft,
  createInitialHighAovDraft,
  createSampleHighAovEvent,
  type AgentBuilderDraft,
  type JourneyDraft
} from "@truffl/core";
import { loadEnv } from "@truffl/config";
import { generateBuilderIntelligence } from "./agent-builder-llm.js";

const env = loadEnv();
const app = Fastify({ logger: true });
const drafts = new Map<string, JourneyDraft>();
const agentDrafts = new Map<string, AgentBuilderDraft>();

await app.register(cors, {
  origin: [env.APP_URL, "http://localhost:3000"],
  credentials: true
});

const messageBodySchema = z.object({
  content: z.string().trim().min(1)
});

function getOrCreateSampleDraft() {
  const existing = drafts.get("draft_high_aov_new_buyer");
  if (existing) return existing;

  const draft = createInitialHighAovDraft();
  drafts.set(draft.id, draft);
  return draft;
}

function getOrCreateAgentBuilderDraft() {
  const existing = agentDrafts.get("agent_builder_demo");
  if (existing) return existing;

  const draft = createInitialAgentBuilderDraft();
  agentDrafts.set(draft.id, draft);
  return draft;
}

app.get("/health", async () => ({
  ok: true,
  service: "truffl-api",
  timestamp: new Date().toISOString()
}));

app.get("/api/journey-drafts/sample", async () => getOrCreateSampleDraft());

app.get("/api/agent-builder/sample", async () => getOrCreateAgentBuilderDraft());

app.post("/api/agent-builder/:draftId/messages", async (request, reply) => {
  const params = z.object({ draftId: z.string() }).parse(request.params);
  const body = messageBodySchema.parse(request.body);
  const draft = agentDrafts.get(params.draftId) ?? getOrCreateAgentBuilderDraft();
  let updated: AgentBuilderDraft;

  try {
    const intelligence = await generateBuilderIntelligence({ content: body.content, draft, env });
    updated = intelligence
      ? applyBuilderIntelligenceResult(draft, body.content, intelligence)
      : applyBuilderMessage(draft, body.content);
  } catch (error) {
    request.log.warn({ error }, "Falling back to deterministic agent builder after LLM failure");
    updated = applyBuilderMessage(draft, body.content);
  }

  agentDrafts.set(updated.id, updated);

  return reply.send(updated);
});

app.post("/api/journey-drafts", async () => {
  const draft = createInitialHighAovDraft();
  drafts.set(draft.id, draft);
  return draft;
});

app.post("/api/journey-drafts/:draftId/messages", async (request, reply) => {
  const params = z.object({ draftId: z.string() }).parse(request.params);
  const body = messageBodySchema.parse(request.body);
  const draft = drafts.get(params.draftId) ?? getOrCreateSampleDraft();
  const updated = applyMerchantMessage(draft, body.content);
  drafts.set(updated.id, updated);

  return reply.send(updated);
});

app.post("/api/simulate/high-aov-cart", async () => ({
  event: createSampleHighAovEvent(),
  journey: getOrCreateSampleDraft(),
  result: {
    eligible: true,
    nextAction: "queue_plivo_test_call",
    note: "Simulation uses the real normalized store-event contract but does not place a call."
  }
}));

const port = Number(process.env.PORT ?? 4000);
const host = process.env.HOST ?? "0.0.0.0";

await app.listen({ port, host });
