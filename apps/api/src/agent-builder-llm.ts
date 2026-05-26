import OpenAI from "openai";
import { z } from "zod";
import type { AgentBuilderDraft, BuilderIntelligenceResult } from "@truffl/core";
import type { AppEnv } from "@truffl/config";

const variableSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["string", "number", "currency", "boolean", "date", "url", "phone", "email", "enum"]),
  description: z.string().min(1),
  source: z.enum(["chat", "uploaded_data", "connector", "knowledgebase", "agent_collected", "computed"]),
  required: z.boolean(),
  sensitive: z.boolean(),
  speakable: z.boolean(),
  writable: z.boolean(),
  analytics: z.boolean()
});

const contactFieldSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["string", "number", "currency", "boolean", "date", "url", "phone", "email", "enum"]),
  required: z.boolean(),
  mappedFrom: z.string().optional(),
  status: z.enum(["mapped", "missing", "optional"])
});

const knowledgeSourceSchema = z.object({
  id: z.string().min(1),
  type: z.enum(["chat_notes", "website", "upload", "policy", "catalog", "manual"]),
  title: z.string().min(1),
  status: z.enum(["planned", "ready", "needs_review"]),
  detail: z.string().min(1)
});

const toolSchema = z.object({
  name: z.string().min(1),
  permission: z.enum(["read", "write", "send", "handoff"]),
  status: z.enum(["simulated", "ready", "needs_credentials"]),
  description: z.string().min(1)
});

const testSchema = z.object({
  title: z.string().min(1),
  type: z.enum(["happy_path", "edge_case", "compliance", "handoff", "data_gap"]),
  expectedOutcome: z.string().min(1)
});

const metricSchema = z.object({
  label: z.string().min(1),
  value: z.string().min(1),
  detail: z.string().min(1)
});

const llmResultSchema = z.object({
  userFacingReply: z.string().min(1),
  title: z.string().optional(),
  useCase: z.string().optional(),
  agentSpec: z
    .object({
      role: z.string().optional(),
      goal: z.string().optional(),
      tone: z.string().optional(),
      openingScript: z.string().optional(),
      guardrails: z.array(z.string()).optional(),
      stateMachine: z.array(z.string()).optional()
    })
    .optional(),
  variables: z.array(variableSchema).optional(),
  contactFields: z.array(contactFieldSchema).optional(),
  knowledgeSources: z.array(knowledgeSourceSchema).optional(),
  tools: z.array(toolSchema).optional(),
  tests: z.array(testSchema).optional(),
  analytics: z.array(metricSchema).optional(),
  tasksDone: z.array(z.string()).optional()
});

export async function generateBuilderIntelligence({
  content,
  draft,
  env
}: {
  content: string;
  draft: AgentBuilderDraft;
  env: AppEnv;
}): Promise<BuilderIntelligenceResult | null> {
  if (env.BUILDER_LLM_PROVIDER !== "openai" || !env.OPENAI_API_KEY) return null;

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model: env.BUILDER_LLM_MODEL,
    input: [
      {
        role: "system",
        content: [
          "You are Truffl's builder brain. Convert the user's chat into structured voice-agent configuration.",
          "Your job is not to merely answer. Produce configuration changes and explain them in plain language.",
          "Prioritize system prompt quality: capture vision, tone, variables, knowledge boundaries, tools, guardrails, handoff, tests, analytics, and self-improvement needs.",
          "Use simulated providers unless the user explicitly provides live credentials. Do not invent integrations.",
          "Return only JSON matching the schema."
        ].join("\n")
      },
      {
        role: "user",
        content: JSON.stringify({
          latestUserMessage: content,
          currentDraft: compactDraftForLlm(draft)
        })
      }
    ],
    text: {
      format: {
        type: "json_schema",
        name: "truffl_agent_builder_intelligence",
        strict: true,
        schema: buildLlmJsonSchema()
      }
    }
  } as never);

  const parsed = JSON.parse(extractResponseText(response));
  return llmResultSchema.parse(parsed);
}

function compactDraftForLlm(draft: AgentBuilderDraft) {
  return {
    title: draft.title,
    useCase: draft.useCase,
    agentSpec: draft.agentSpec,
    variables: draft.variables,
    contactSchema: draft.contactSchema,
    knowledgeSources: draft.knowledgeSources,
    tools: draft.tools,
    tests: draft.tests,
    analytics: draft.analytics,
    currentPromptScore: draft.systemPromptWorkbench.score,
    recentMessages: draft.messages.slice(-6)
  };
}

function extractResponseText(response: unknown): string {
  const maybe = response as {
    output_text?: string;
    output?: Array<{ content?: Array<{ text?: string; type?: string }> }>;
  };

  if (maybe.output_text) return maybe.output_text;

  const text = maybe.output
    ?.flatMap((item) => item.content ?? [])
    .map((item) => item.text)
    .filter((item): item is string => Boolean(item))
    .join("");

  if (!text) throw new Error("OpenAI response did not include text output.");
  return text;
}

const variableJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "type", "description", "source", "required", "sensitive", "speakable", "writable", "analytics"],
  properties: {
    name: { type: "string" },
    type: { enum: ["string", "number", "currency", "boolean", "date", "url", "phone", "email", "enum"] },
    description: { type: "string" },
    source: { enum: ["chat", "uploaded_data", "connector", "knowledgebase", "agent_collected", "computed"] },
    required: { type: "boolean" },
    sensitive: { type: "boolean" },
    speakable: { type: "boolean" },
    writable: { type: "boolean" },
    analytics: { type: "boolean" }
  }
};

const contactFieldJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "type", "required", "status"],
  properties: {
    name: { type: "string" },
    type: { enum: ["string", "number", "currency", "boolean", "date", "url", "phone", "email", "enum"] },
    required: { type: "boolean" },
    mappedFrom: { type: "string" },
    status: { enum: ["mapped", "missing", "optional"] }
  }
};

const knowledgeSourceJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["id", "type", "title", "status", "detail"],
  properties: {
    id: { type: "string" },
    type: { enum: ["chat_notes", "website", "upload", "policy", "catalog", "manual"] },
    title: { type: "string" },
    status: { enum: ["planned", "ready", "needs_review"] },
    detail: { type: "string" }
  }
};

const toolJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["name", "permission", "status", "description"],
  properties: {
    name: { type: "string" },
    permission: { enum: ["read", "write", "send", "handoff"] },
    status: { enum: ["simulated", "ready", "needs_credentials"] },
    description: { type: "string" }
  }
};

const testJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["title", "type", "expectedOutcome"],
  properties: {
    title: { type: "string" },
    type: { enum: ["happy_path", "edge_case", "compliance", "handoff", "data_gap"] },
    expectedOutcome: { type: "string" }
  }
};

const metricJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["label", "value", "detail"],
  properties: {
    label: { type: "string" },
    value: { type: "string" },
    detail: { type: "string" }
  }
};

function buildLlmJsonSchema() {
  return {
    type: "object",
    additionalProperties: false,
    required: ["userFacingReply"],
    properties: {
      userFacingReply: { type: "string" },
      title: { type: "string" },
      useCase: { type: "string" },
      agentSpec: {
        type: "object",
        additionalProperties: false,
        properties: {
          role: { type: "string" },
          goal: { type: "string" },
          tone: { type: "string" },
          openingScript: { type: "string" },
          guardrails: { type: "array", items: { type: "string" } },
          stateMachine: { type: "array", items: { type: "string" } }
        }
      },
      variables: { type: "array", items: variableJsonSchema },
      contactFields: { type: "array", items: contactFieldJsonSchema },
      knowledgeSources: { type: "array", items: knowledgeSourceJsonSchema },
      tools: { type: "array", items: toolJsonSchema },
      tests: { type: "array", items: testJsonSchema },
      analytics: { type: "array", items: metricJsonSchema },
      tasksDone: { type: "array", items: { type: "string" } }
    }
  };
}
