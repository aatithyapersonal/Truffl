import { Worker } from "bullmq";
import { Redis } from "ioredis";
import { createSampleHighAovEvent } from "@truffl/core";
import { loadEnv } from "@truffl/config";

const env = loadEnv();
const enableRedisWorker = process.env.WORKER_ENABLE_REDIS === "true";

if (!enableRedisWorker) {
  const sample = createSampleHighAovEvent();
  console.log("[worker] Dry-run mode. Set WORKER_ENABLE_REDIS=true after Redis is running.");
  console.log("[worker] Sample normalized event:", {
    eventType: sample.eventType,
    source: sample.source,
    currency: sample.cart.total.currency,
    amountMinor: sample.cart.total.amountMinor
  });
} else {
  const connection = new Redis(env.REDIS_URL, {
    maxRetriesPerRequest: null
  });

  const worker = new Worker(
    "journey-events",
    async (job) => {
      console.log("[worker] Processing job", job.name, job.data);
      return { ok: true };
    },
    { connection }
  );

  worker.on("completed", (job) => {
    console.log("[worker] Completed", job.id);
  });

  worker.on("failed", (job, error) => {
    console.error("[worker] Failed", job?.id, error);
  });
}
