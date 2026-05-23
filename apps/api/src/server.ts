import cors from "@fastify/cors";
import Fastify from "fastify";
import { z } from "zod";
import {
  applyMerchantMessage,
  createInitialHighAovDraft,
  createSampleHighAovEvent,
  type JourneyDraft
} from "@truffl/core";
import { loadEnv } from "@truffl/config";

const env = loadEnv();
const app = Fastify({ logger: true });
const drafts = new Map<string, JourneyDraft>();

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

app.get("/health", async () => ({
  ok: true,
  service: "truffl-api",
  timestamp: new Date().toISOString()
}));

app.get("/api/journey-drafts/sample", async () => getOrCreateSampleDraft());

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
