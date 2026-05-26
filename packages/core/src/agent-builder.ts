import { assessAgentComponents, type AgentComponentAssessment } from "./agent-components.js";
import { buildSystemPromptWorkbench, type SystemPromptWorkbench } from "./system-prompt-workbench.js";

export type VariableType = "string" | "number" | "currency" | "boolean" | "date" | "url" | "phone" | "email" | "enum";

export type VariableSource =
  | "chat"
  | "uploaded_data"
  | "connector"
  | "knowledgebase"
  | "agent_collected"
  | "computed";

export type AgentVariable = {
  name: string;
  type: VariableType;
  description: string;
  source: VariableSource;
  required: boolean;
  sensitive: boolean;
  speakable: boolean;
  writable: boolean;
  analytics: boolean;
};

export type ContactField = {
  name: string;
  type: VariableType;
  required: boolean;
  mappedFrom?: string;
  status: "mapped" | "missing" | "optional";
};

export type KnowledgeSource = {
  id: string;
  type: "chat_notes" | "website" | "upload" | "policy" | "catalog" | "manual";
  title: string;
  status: "planned" | "ready" | "needs_review";
  detail: string;
};

export type VoiceTool = {
  name: string;
  permission: "read" | "write" | "send" | "handoff";
  status: "simulated" | "ready" | "needs_credentials";
  description: string;
};

export type TestScenario = {
  title: string;
  type: "happy_path" | "edge_case" | "compliance" | "handoff" | "data_gap";
  expectedOutcome: string;
};

export type AnalyticsMetric = {
  label: string;
  value: string;
  detail: string;
};

export type BuilderTask = {
  label: string;
  status: "done" | "active" | "blocked" | "queued";
};

export type AgentBuilderDraft = {
  id: string;
  title: string;
  useCase: string;
  mode: "simulated" | "ready_for_test" | "live";
  messages: BuilderMessage[];
  agentSpec: {
    role: string;
    goal: string;
    tone: string;
    systemPrompt: string;
    openingScript: string;
    guardrails: string[];
    stateMachine: string[];
  };
  variables: AgentVariable[];
  contactSchema: ContactField[];
  knowledgeSources: KnowledgeSource[];
  tools: VoiceTool[];
  tests: TestScenario[];
  analytics: AnalyticsMetric[];
  tasks: BuilderTask[];
  componentAssessments: AgentComponentAssessment[];
  systemPromptWorkbench: SystemPromptWorkbench;
  providerPlan: {
    telephony: string;
    stt: string;
    llm: string;
    tts: string;
    recording: string;
    storage: string;
  };
  updatedAt: string;
};

export type BuilderMessage = {
  role: "user" | "truffl";
  content: string;
  createdAt: string;
};

export type UploadedDataPreview = {
  fileName: string;
  fileType: string;
  columns: string[];
  rowCount?: number;
};

export type BuilderIntelligenceResult = {
  userFacingReply: string;
  title?: string;
  useCase?: string;
  agentSpec?: Partial<AgentBuilderDraft["agentSpec"]>;
  variables?: AgentVariable[];
  contactFields?: ContactField[];
  knowledgeSources?: KnowledgeSource[];
  tools?: VoiceTool[];
  tests?: TestScenario[];
  analytics?: AnalyticsMetric[];
  tasksDone?: string[];
};

export function createInitialAgentBuilderDraft(): AgentBuilderDraft {
  const now = new Date().toISOString();

  const draft: AgentBuilderDraft = {
    id: "agent_builder_demo",
    title: "Voice Agent Builder",
    useCase: "Conversationally define a voice agent, then test it before connecting live providers.",
    mode: "simulated",
    messages: [
      {
        role: "truffl",
        content:
          "Describe the agent you want to build. I will turn the conversation into variables, data requirements, knowledge, scripts, tools, tests, analytics, and a simulated deployment plan.",
        createdAt: now
      }
    ],
    agentSpec: {
      role: "AI voice agent for a business workflow",
      goal: "Understand the user-selected use case, complete the call objective, and safely hand off when needed.",
      tone: "Helpful, concise, commercially aware, and calm.",
      systemPrompt:
        "You are a voice agent representing the merchant. Use approved knowledge, respect call rules, collect only necessary information, and summarize outcomes clearly.",
      openingScript:
        "Hi, this is the assistant calling on behalf of the brand. I am reaching out about your recent request and can help with the next step.",
      guardrails: [
        "Do not invent policy, pricing, availability, or offers.",
        "Confirm sensitive details before acting.",
        "Respect opt-out requests immediately.",
        "Offer human handoff when confidence is low or the customer requests it."
      ],
      stateMachine: [
        "queued",
        "dialing",
        "connected",
        "qualifying",
        "handling_objection",
        "call_to_action",
        "handoff_or_followup",
        "completed"
      ]
    },
    variables: [
      variable("customer_name", "string", "Customer or lead name.", "uploaded_data", true, true, true, false, true),
      variable("phone_number", "phone", "Dialable customer phone number.", "uploaded_data", true, true, false, false, false),
      variable("use_case_goal", "string", "Business outcome the agent should drive.", "chat", true, false, true, true, true),
      variable("handoff_reason", "string", "Why a human should take over.", "agent_collected", false, false, true, true, true)
    ],
    contactSchema: [
      field("customer_name", "string", true, "missing"),
      field("phone_number", "phone", true, "missing"),
      field("email", "email", false, "optional"),
      field("country", "string", false, "optional"),
      field("preferred_language", "string", false, "optional")
    ],
    knowledgeSources: [
      {
        id: "chat_notes",
        type: "chat_notes",
        title: "Builder conversation",
        status: "ready",
        detail: "Use the user's chat as the first source of agent requirements."
      },
      {
        id: "brand_site",
        type: "website",
        title: "Website crawl",
        status: "planned",
        detail: "Add website URLs for product, FAQ, policy, and offer knowledge."
      }
    ],
    tools: [
      tool("lookup_contact", "read", "simulated", "Read uploaded or connector-provided customer fields."),
      tool("send_followup_link", "send", "simulated", "Send a link by WhatsApp, SMS, or email after the call."),
      tool("create_handoff_task", "handoff", "simulated", "Create a human follow-up item when the call needs intervention."),
      tool("log_call_outcome", "write", "ready", "Write summary, outcome, variables, transcript, and analytics events.")
    ],
    tests: [
      {
        title: "Interested customer",
        type: "happy_path",
        expectedOutcome: "Agent answers questions, confirms next step, sends follow-up, and logs conversion intent."
      },
      {
        title: "Wrong number",
        type: "edge_case",
        expectedOutcome: "Agent apologizes, marks the number invalid, and suppresses future calls."
      },
      {
        title: "Human requested",
        type: "handoff",
        expectedOutcome: "Agent captures reason, creates handoff task, and ends politely."
      }
    ],
    analytics: [
      { label: "Contacts ready", value: "0", detail: "Upload a list to create a simulated call queue." },
      { label: "Test calls", value: "3", detail: "Generated baseline scenarios." },
      { label: "Recording", value: "Simulated", detail: "Transcript and recording metadata are modeled before live calls." },
      { label: "Blocked items", value: "2", detail: "Real telephony and live data connectors are intentionally deferred." }
    ],
    tasks: [
      { label: "Created base voice-agent spec", status: "done" },
      { label: "Inferred starter variables", status: "done" },
      { label: "Prepared upload mapping flow", status: "active" },
      { label: "Add website/knowledge sources", status: "queued" },
      { label: "Connect live telephony", status: "blocked" }
    ],
    componentAssessments: [],
    systemPromptWorkbench: emptySystemPromptWorkbench(),
    providerPlan: {
      telephony: "Mock now; Plivo/Twilio adapters later",
      stt: "Mock transcript now; provider adapter later",
      llm: "OpenAI reasoning layer",
      tts: "Mock voice now; TTS adapter later",
      recording: "Simulated recording metadata and transcript",
      storage: "Local/Postgres metadata now; S3 later"
    },
    updatedAt: now
  };

  return refreshDerivedIntelligence(draft);
}

export function applyBuilderMessage(draft: AgentBuilderDraft, content: string): AgentBuilderDraft {
  const now = new Date().toISOString();
  const normalized = content.toLowerCase();
  const next = structuredClone(draft);
  const addedTasks: string[] = [];

  next.messages.push({ role: "user", content, createdAt: now });

  if (includesAny(normalized, ["abandoned cart", "cart", "shopify", "checkout"])) {
    next.useCase = "Recover abandoned carts with an AI voice agent, using uploaded data or a future store connector.";
    next.title = "Abandoned Cart Voice Agent";
    next.agentSpec.goal = "Recover qualified abandoned carts while answering product, offer, and policy questions.";
    next.agentSpec.openingScript =
      "Hi {{customer_name}}, this is the assistant calling about the items you were looking at. I can help answer questions or send the checkout link.";
    addVariables(next, [
      variable("cart_value", "currency", "Cart value used for eligibility and analytics.", "uploaded_data", true, false, true, false, true),
      variable("currency", "string", "Currency for cart and revenue reporting.", "uploaded_data", true, false, true, false, true),
      variable("product_names", "string", "Products in the cart.", "uploaded_data", true, false, true, false, true),
      variable("recovery_url", "url", "Checkout or cart recovery link.", "uploaded_data", false, false, false, false, true),
      variable("discount_code", "string", "Optional offer code approved by the merchant.", "chat", false, false, true, true, true)
    ]);
    addFields(next, [
      field("cart_value", "currency", true, "missing"),
      field("currency", "string", true, "missing"),
      field("product_names", "string", true, "missing"),
      field("recovery_url", "url", false, "optional")
    ]);
    addedTasks.push("Configured abandoned-cart use case");
  }

  if (includesAny(normalized, ["premium", "luxury", "polished"])) {
    next.agentSpec.tone = "Polished, premium, calm, and trust-building.";
    addedTasks.push("Tuned system prompt tone for premium brand voice");
  }

  if (includesAny(normalized, ["not pushy", "gentle", "respectful"])) {
    next.agentSpec.tone = "Warm, respectful, non-pushy, and helpful.";
    addedTasks.push("Tuned system prompt to avoid pushy behavior");
  }

  if (includesAny(normalized, ["system prompt", "prompt", "guardrail", "self test", "self improve", "heal"])) {
    addedTasks.push("Regenerated and self-tested system prompt");
  }

  if (includesAny(normalized, ["appointment", "booking", "demo", "schedule"])) {
    next.useCase = "Qualify leads and book appointments or demos through a voice agent.";
    next.title = "Appointment Booking Voice Agent";
    next.agentSpec.goal = "Confirm fit, handle scheduling objections, and book a next step.";
    addVariables(next, [
      variable("appointment_slot", "date", "Preferred appointment or callback time.", "agent_collected", false, false, true, true, true),
      variable("lead_source", "string", "Where the lead came from.", "uploaded_data", false, false, false, false, true),
      variable("sales_owner", "string", "Human owner for handoff.", "uploaded_data", false, false, false, false, true)
    ]);
    addedTasks.push("Configured appointment-booking use case");
  }

  if (includesAny(normalized, ["pdf", "csv", "sheet", "spreadsheet", "upload", "contacts", "customer data"])) {
    addKnowledgeSource(next, {
      id: "customer_upload",
      type: "upload",
      title: "Customer/contact upload",
      status: "planned",
      detail: "Upload a CSV, spreadsheet, PDF, JSON, or text file and confirm field mappings before calls."
    });
    addedTasks.push("Prepared customer data upload path");
  }

  if (includesAny(normalized, ["website", "crawl", "faq", "knowledge", "policy", "return", "shipping"])) {
    addKnowledgeSource(next, {
      id: "website_knowledge",
      type: "website",
      title: "Website and policy knowledge",
      status: "planned",
      detail: "Collect product, FAQ, shipping, return, warranty, pricing, and offer pages for retrieval."
    });
    addedTasks.push("Added website knowledge plan");
  }

  if (includesAny(normalized, ["record", "recording", "analytics", "transcript", "report"])) {
    next.analytics = [
      { label: "Calls attempted", value: "Simulated", detail: "Will count every queued call attempt." },
      { label: "Connected rate", value: "Simulated", detail: "Will track answered calls and call duration." },
      { label: "Outcomes", value: "Ready", detail: "Interested, not interested, wrong number, handoff, follow-up, converted." },
      { label: "Recordings", value: "Modeled", detail: "Recording metadata, transcript, retention, and QA flags are in the spec." }
    ];
    addedTasks.push("Expanded analytics and recording plan");
  }

  if (includesAny(normalized, ["variable", "custom field", "custom fields"])) {
    addedTasks.push("Custom variable layer is active");
  }

  next.tasks = mergeTasks(next.tasks, addedTasks);
  refreshDerivedIntelligence(next, content);
  next.messages.push({ role: "truffl", content: buildBuilderReply(next, addedTasks), createdAt: now });
  next.updatedAt = now;

  return next;
}

export function applyBuilderIntelligenceResult(
  draft: AgentBuilderDraft,
  content: string,
  intelligence: BuilderIntelligenceResult
): AgentBuilderDraft {
  const now = new Date().toISOString();
  const next = structuredClone(draft);

  next.messages.push({ role: "user", content, createdAt: now });

  if (intelligence.title) next.title = intelligence.title;
  if (intelligence.useCase) next.useCase = intelligence.useCase;
  if (intelligence.agentSpec) {
    next.agentSpec = {
      ...next.agentSpec,
      ...intelligence.agentSpec,
      guardrails: intelligence.agentSpec.guardrails ?? next.agentSpec.guardrails,
      stateMachine: intelligence.agentSpec.stateMachine ?? next.agentSpec.stateMachine
    };
  }

  addVariables(next, intelligence.variables ?? []);
  addFields(next, intelligence.contactFields ?? []);
  for (const source of intelligence.knowledgeSources ?? []) addKnowledgeSource(next, source);
  for (const toolItem of intelligence.tools ?? []) addTool(next, toolItem);
  for (const test of intelligence.tests ?? []) addTest(next, test);
  for (const metric of intelligence.analytics ?? []) addMetric(next, metric);

  next.tasks = mergeTasks(next.tasks, intelligence.tasksDone ?? ["Interpreted conversation with LLM"]);
  refreshDerivedIntelligence(next, content);
  next.messages.push({
    role: "truffl",
    content: intelligence.userFacingReply || buildBuilderReply(next, intelligence.tasksDone ?? []),
    createdAt: now
  });
  next.updatedAt = now;

  return next;
}

export function applyUploadedDataPreview(draft: AgentBuilderDraft, preview: UploadedDataPreview): AgentBuilderDraft {
  const now = new Date().toISOString();
  const next = structuredClone(draft);
  const normalizedColumns = preview.columns.map((column) => column.toLowerCase().replace(/[^a-z0-9]+/g, "_"));

  next.contactSchema = next.contactSchema.map((fieldItem) => {
    const match = preview.columns.find((column, index) => {
      const normalizedColumn = normalizedColumns[index] ?? "";
      return normalizedColumn === fieldItem.name || normalizedColumn.includes(fieldItem.name);
    });
    return match ? { ...fieldItem, mappedFrom: match, status: "mapped" } : fieldItem;
  });

  addKnowledgeSource(next, {
    id: `upload_${slug(preview.fileName)}`,
    type: "upload",
    title: preview.fileName,
    status: "needs_review",
    detail: `${preview.columns.length || "Unknown"} fields detected${preview.rowCount ? ` across about ${preview.rowCount} rows` : ""}. Confirm mappings before calls.`
  });

  next.analytics = next.analytics.map((metric) =>
    metric.label === "Contacts ready"
      ? { ...metric, value: preview.rowCount ? String(preview.rowCount) : "Preview", detail: "Uploaded data is ready for mapping review." }
      : metric
  );
  next.tasks = mergeTasks(next.tasks, ["Detected uploaded data fields", "Mapped matching contact variables"]);
  refreshDerivedIntelligence(next);
  next.messages.push({
    role: "truffl",
    content: `I inspected ${preview.fileName}. I detected ${preview.columns.length || "some"} fields and mapped the obvious ones. Next we should review required fields, then generate the simulated call queue.`,
    createdAt: now
  });
  next.updatedAt = now;

  return next;
}

function refreshDerivedIntelligence(draft: AgentBuilderDraft, latestUserMessage?: string): AgentBuilderDraft {
  draft.systemPromptWorkbench = buildSystemPromptWorkbench({
    useCase: draft.useCase,
    role: draft.agentSpec.role,
    goal: draft.agentSpec.goal,
    tone: draft.agentSpec.tone,
    openingScript: draft.agentSpec.openingScript,
    guardrails: draft.agentSpec.guardrails,
    stateMachine: draft.agentSpec.stateMachine,
    variables: draft.variables,
    knowledgeSources: draft.knowledgeSources,
    tools: draft.tools,
    tests: draft.tests,
    latestUserMessage
  });
  draft.agentSpec.systemPrompt = draft.systemPromptWorkbench.prompt;

  const requiredFields = draft.contactSchema.filter((fieldItem) => fieldItem.required);
  draft.componentAssessments = assessAgentComponents({
    hasUseCase: Boolean(draft.useCase.trim()),
    variableCount: draft.variables.length,
    requiredFields: requiredFields.length,
    mappedRequiredFields: requiredFields.filter((fieldItem) => fieldItem.status === "mapped").length,
    knowledgeSourceCount: draft.knowledgeSources.length,
    toolCount: draft.tools.length,
    testCount: draft.tests.length,
    analyticsMetricCount: draft.analytics.length,
    liveProviderReady: false
  });
  return draft;
}

function emptySystemPromptWorkbench(): SystemPromptWorkbench {
  return {
    version: 1,
    prompt: "",
    score: 0,
    sentiment: {
      userVision: "",
      desiredTone: "",
      riskPosture: "balanced",
      confidence: "low"
    },
    sections: [],
    qualityChecks: [],
    selfTests: [],
    improvementLog: []
  };
}

function variable(
  name: string,
  type: VariableType,
  description: string,
  source: VariableSource,
  required: boolean,
  sensitive: boolean,
  speakable: boolean,
  writable: boolean,
  analytics: boolean
): AgentVariable {
  return { name, type, description, source, required, sensitive, speakable, writable, analytics };
}

function field(name: string, type: VariableType, required: boolean, status: ContactField["status"]): ContactField {
  return { name, type, required, status };
}

function tool(name: string, permission: VoiceTool["permission"], status: VoiceTool["status"], description: string): VoiceTool {
  return { name, permission, status, description };
}

function addVariables(draft: AgentBuilderDraft, variables: AgentVariable[]) {
  for (const nextVariable of variables) {
    if (!draft.variables.some((existing) => existing.name === nextVariable.name)) {
      draft.variables.push(nextVariable);
    }
  }
}

function addFields(draft: AgentBuilderDraft, fields: ContactField[]) {
  for (const nextField of fields) {
    if (!draft.contactSchema.some((existing) => existing.name === nextField.name)) {
      draft.contactSchema.push(nextField);
    }
  }
}

function addKnowledgeSource(draft: AgentBuilderDraft, source: KnowledgeSource) {
  if (!draft.knowledgeSources.some((existing) => existing.id === source.id)) {
    draft.knowledgeSources.push(source);
  }
}

function addTool(draft: AgentBuilderDraft, toolItem: VoiceTool) {
  const existing = draft.tools.find((item) => item.name === toolItem.name);
  if (existing) {
    Object.assign(existing, toolItem);
  } else {
    draft.tools.push(toolItem);
  }
}

function addTest(draft: AgentBuilderDraft, test: TestScenario) {
  const existing = draft.tests.find((item) => item.title === test.title);
  if (existing) {
    Object.assign(existing, test);
  } else {
    draft.tests.push(test);
  }
}

function addMetric(draft: AgentBuilderDraft, metric: AnalyticsMetric) {
  const existing = draft.analytics.find((item) => item.label === metric.label);
  if (existing) {
    Object.assign(existing, metric);
  } else {
    draft.analytics.push(metric);
  }
}

function mergeTasks(tasks: BuilderTask[], doneLabels: string[]): BuilderTask[] {
  const next = [...tasks];
  for (const label of doneLabels) {
    const existing = next.find((task) => task.label === label);
    if (existing) {
      existing.status = "done";
    } else {
      next.unshift({ label, status: "done" });
    }
  }
  return next;
}

function buildBuilderReply(draft: AgentBuilderDraft, completed: string[]): string {
  const taskLine = completed.length ? `Done: ${completed.join(", ")}.` : "I updated the agent spec from your note.";
  const requiredMissing = draft.contactSchema.filter((fieldItem) => fieldItem.required && fieldItem.status !== "mapped");
  const nextStep =
    requiredMissing.length > 0
      ? `Next, upload or map: ${requiredMissing.map((fieldItem) => fieldItem.name).join(", ")}.`
      : "Next, we can run the call simulator or tighten the script.";

  return `${taskLine} I updated the live voice-agent spec, variables, data requirements, knowledge plan, tests, and analytics view. ${nextStep}`;
}

function includesAny(value: string, needles: string[]): boolean {
  return needles.some((needle) => value.includes(needle));
}

function slug(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 48) || "data";
}
