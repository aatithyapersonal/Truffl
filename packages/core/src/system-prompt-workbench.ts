import type { AgentVariable, KnowledgeSource, TestScenario, VoiceTool } from "./agent-builder.js";

export type PromptSectionId =
  | "identity"
  | "mission"
  | "audience"
  | "variables"
  | "knowledge"
  | "conversation"
  | "tools"
  | "guardrails"
  | "escalation"
  | "analytics";

export type PromptQualityStatus = "pass" | "warn" | "fail";

export type PromptSection = {
  id: PromptSectionId;
  title: string;
  content: string;
};

export type PromptQualityCheck = {
  criterion: string;
  status: PromptQualityStatus;
  detail: string;
};

export type PromptSelfTest = {
  title: string;
  scenario: string;
  expectedBehavior: string;
  promptRisk: string;
  selfHeal: string;
  status: PromptQualityStatus;
};

export type PromptSentimentProfile = {
  userVision: string;
  desiredTone: string;
  riskPosture: "conservative" | "balanced" | "assertive";
  confidence: "low" | "medium" | "high";
};

export type SystemPromptWorkbench = {
  version: number;
  prompt: string;
  score: number;
  sentiment: PromptSentimentProfile;
  sections: PromptSection[];
  qualityChecks: PromptQualityCheck[];
  selfTests: PromptSelfTest[];
  improvementLog: string[];
};

export type SystemPromptInput = {
  useCase: string;
  role: string;
  goal: string;
  tone: string;
  openingScript: string;
  guardrails: string[];
  stateMachine: string[];
  variables: AgentVariable[];
  knowledgeSources: KnowledgeSource[];
  tools: VoiceTool[];
  tests: TestScenario[];
  latestUserMessage?: string;
};

export function buildSystemPromptWorkbench(input: SystemPromptInput): SystemPromptWorkbench {
  const sentiment = inferSentimentProfile(input);
  const sections = buildPromptSections(input, sentiment);
  const prompt = sections.map((section) => `## ${section.title}\n${section.content}`).join("\n\n");
  const qualityChecks = evaluateSystemPrompt({ ...input, prompt, sections });
  const selfTests = buildSelfTests(input, qualityChecks);
  const improvementLog = buildImprovementLog(input, qualityChecks, selfTests, sentiment);
  const score = scorePrompt(qualityChecks, selfTests);

  return {
    version: 1,
    prompt,
    score,
    sentiment,
    sections,
    qualityChecks,
    selfTests,
    improvementLog
  };
}

function buildPromptSections(input: SystemPromptInput, sentiment: PromptSentimentProfile): PromptSection[] {
  const requiredVariables = input.variables.filter((variable) => variable.required);
  const optionalVariables = input.variables.filter((variable) => !variable.required);
  const simulatedTools = input.tools.filter((tool) => tool.status === "simulated").map((tool) => tool.name);
  const readyTools = input.tools.filter((tool) => tool.status === "ready").map((tool) => tool.name);

  return [
    {
      id: "identity",
      title: "Identity",
      content: [
        `You are ${input.role}.`,
        "You speak on behalf of the business, not as a generic assistant.",
        "You are operating inside a phone-call workflow, so every response must be concise, spoken, and easy to interrupt."
      ].join("\n")
    },
    {
      id: "mission",
      title: "Mission",
      content: [
        `Primary use case: ${input.useCase}`,
        `Primary goal: ${input.goal}`,
        `User vision interpreted from setup chat: ${sentiment.userVision}`,
        "Success means moving the customer to the next approved step while preserving trust, consent, and accurate records."
      ].join("\n")
    },
    {
      id: "audience",
      title: "Audience And Tone",
      content: [
        `Tone: ${sentiment.desiredTone || input.tone}`,
        `Risk posture: ${sentiment.riskPosture}.`,
        "Assume the customer did not ask to speak with an AI agent, so be useful quickly, avoid rambling, and give them control.",
        `Suggested opening: ${input.openingScript}`
      ].join("\n")
    },
    {
      id: "variables",
      title: "Variables And Missing Data",
      content: [
        "Use variables only when they are present and validated.",
        requiredVariables.length
          ? `Required variables: ${requiredVariables.map(describeVariable).join("; ")}.`
          : "No required variables have been defined yet; ask the builder for the minimum data schema before live deployment.",
        optionalVariables.length ? `Optional variables: ${optionalVariables.map(describeVariable).join("; ")}.` : "",
        "If a required variable is missing, do not invent it. Ask a safe clarifying question, use a fallback path, or mark the call for review."
      ]
        .filter(Boolean)
        .join("\n")
    },
    {
      id: "knowledge",
      title: "Knowledge And Truthfulness",
      content: [
        `Approved knowledge sources: ${input.knowledgeSources.map((source) => `${source.title} (${source.status})`).join(", ")}.`,
        "Answer only from approved knowledge, provided variables, or explicitly configured tools.",
        "If policy, pricing, product availability, or offer details are missing or conflicting, say you will check and create a handoff/follow-up instead of guessing.",
        "Never fabricate discounts, delivery timelines, product claims, warranties, compliance statements, or personal data."
      ].join("\n")
    },
    {
      id: "conversation",
      title: "Conversation Flow",
      content: [
        `Call states: ${input.stateMachine.join(" -> ")}.`,
        "Start with context, verify the conversation is welcome, help with the specific objective, handle one objection at a time, then move to the next approved step.",
        "Keep turns short. Prefer one clear question over multiple stacked questions.",
        "If the customer is busy, offer a callback or follow-up link. If the customer is angry, apologize once, stop selling, and move to resolution or opt-out."
      ].join("\n")
    },
    {
      id: "tools",
      title: "Tools And Actions",
      content: [
        readyTools.length ? `Ready tools: ${readyTools.join(", ")}.` : "No live action tools are ready yet.",
        simulatedTools.length ? `Simulated tools: ${simulatedTools.join(", ")}.` : "",
        "Use tools only for their stated purpose. Do not claim an action succeeded until the tool result confirms it.",
        "Every tool action must produce an audit-friendly outcome note."
      ]
        .filter(Boolean)
        .join("\n")
    },
    {
      id: "guardrails",
      title: "Guardrails",
      content: [
        ...input.guardrails,
        "Respect opt-out requests immediately.",
        "Do not pressure, threaten scarcity unless provided by approved knowledge, or imply consequences that are not true.",
        "Do not request unnecessary sensitive data. Do not repeat sensitive values aloud unless the variable is marked speakable."
      ].join("\n")
    },
    {
      id: "escalation",
      title: "Escalation And Recovery",
      content: [
        "Offer human handoff when the customer asks for a person, the answer requires unavailable knowledge, the customer is upset, or the call enters a high-risk topic.",
        "When escalating, summarize the reason, customer intent, relevant variables, and next best action.",
        "For wrong number, voicemail, silence, or invalid data, follow the configured state outcome and stop."
      ].join("\n")
    },
    {
      id: "analytics",
      title: "Outcome Logging",
      content: [
        "At the end of every call, produce a concise outcome summary.",
        "Log: final state, customer intent, objections, next action, handoff reason, follow-up channel, variables collected, and any knowledge gaps.",
        "Flag transcripts for review when the agent was uncertain, a tool failed, or a policy answer was missing."
      ].join("\n")
    }
  ];
}

function evaluateSystemPrompt(input: SystemPromptInput & { prompt: string; sections: PromptSection[] }): PromptQualityCheck[] {
  return [
    check("Clear identity", input.prompt.includes("You are") && input.prompt.includes("phone-call workflow"), "The prompt must define who the agent is and the channel it operates in."),
    check("Specific mission", input.goal.length > 20 && input.useCase.length > 20, "The prompt needs a concrete business objective, not a vague assistant role."),
    check("Tone captured", Boolean(input.tone || input.latestUserMessage), "The prompt should translate the user's desired style into call behavior."),
    check("Variable grounding", input.variables.length >= 4 && input.prompt.includes("do not invent"), "The prompt must explain how to use variables and what to do when data is missing."),
    check("Knowledge boundary", input.prompt.includes("Answer only from approved knowledge"), "The prompt must prevent hallucinated policies, offers, or product claims."),
    check("Tool discipline", input.prompt.includes("Do not claim an action succeeded"), "The prompt must treat tools as auditable actions with failure modes."),
    check("Escalation behavior", input.prompt.includes("human handoff") || input.prompt.includes("escalating"), "The prompt must say when to stop and hand off."),
    check("Outcome logging", input.prompt.includes("outcome summary") && input.prompt.includes("knowledge gaps"), "The prompt must define what the runtime records after the call."),
    check("Not over-scripted", input.prompt.length < 7000, "The system prompt should be comprehensive but not bloated enough to bury the priorities.")
  ];
}

function buildSelfTests(input: SystemPromptInput, checks: PromptQualityCheck[]): PromptSelfTest[] {
  const missingData = input.variables.filter((variable) => variable.required).slice(0, 3).map((variable) => variable.name);
  const hasFailingCheck = checks.some((checkItem) => checkItem.status === "fail");

  return [
    {
      title: "Missing required data",
      scenario: `The call starts but ${missingData.join(", ") || "a required field"} is missing.`,
      expectedBehavior: "Agent must not invent the value; it should ask safely, use fallback, or mark review.",
      promptRisk: missingData.length ? "Handled by variable grounding section." : "No required variables defined yet.",
      selfHeal: "Add required variables and missing-data behavior before live launch.",
      status: missingData.length ? "pass" : "warn"
    },
    {
      title: "Customer asks for unsupported policy",
      scenario: "Customer asks a question about refunds, warranty, price, or delivery that is not in knowledge.",
      expectedBehavior: "Agent says it will check, avoids guessing, and creates follow-up or handoff.",
      promptRisk: "Handled by knowledge boundary and escalation sections.",
      selfHeal: "Add source-specific policy pages to the knowledgebase.",
      status: "pass"
    },
    {
      title: "Customer asks for a human",
      scenario: "Customer says: connect me to a person.",
      expectedBehavior: "Agent stops persuasion, captures reason, and follows handoff path.",
      promptRisk: "Handled by escalation section.",
      selfHeal: "Configure the exact human handoff tool/provider before live calls.",
      status: "pass"
    },
    {
      title: "Prompt consistency",
      scenario: "Prompt has competing instructions or missing core sections.",
      expectedBehavior: "Prompt should keep hierarchy clear: identity, mission, data, knowledge, tools, guardrails, outcomes.",
      promptRisk: hasFailingCheck ? "One or more required prompt qualities failed." : "No severe contradiction detected.",
      selfHeal: hasFailingCheck ? "Regenerate with failed quality criteria as hard requirements." : "No immediate repair needed.",
      status: hasFailingCheck ? "warn" : "pass"
    }
  ];
}

function buildImprovementLog(
  input: SystemPromptInput,
  checks: PromptQualityCheck[],
  selfTests: PromptSelfTest[],
  sentiment: PromptSentimentProfile
): string[] {
  const log = [
    `Translated setup chat into a ${sentiment.riskPosture} prompt with ${sentiment.desiredTone.toLowerCase()} tone.`,
    "Separated system behavior from opening script so the agent is not trapped in a brittle script.",
    "Added missing-data, knowledge-boundary, tool-confirmation, handoff, and outcome-logging rules."
  ];

  for (const checkItem of checks.filter((checkItem) => checkItem.status !== "pass")) {
    log.push(`Prompt quality needs work: ${checkItem.criterion} - ${checkItem.detail}`);
  }

  for (const test of selfTests.filter((test) => test.status !== "pass")) {
    log.push(`Self-test repair suggested: ${test.title} - ${test.selfHeal}`);
  }

  if (input.latestUserMessage) {
    log.push("Regenerated after the latest user instruction, preserving previous constraints unless directly superseded.");
  }

  return log;
}

function inferSentimentProfile(input: SystemPromptInput): PromptSentimentProfile {
  const text = `${input.useCase} ${input.goal} ${input.tone} ${input.latestUserMessage ?? ""}`.toLowerCase();
  const desiredTone = inferTone(text, input.tone);
  const riskPosture = text.includes("aggressive") || text.includes("salesy") || text.includes("push")
    ? "assertive"
    : text.includes("careful") || text.includes("premium") || text.includes("not pushy") || text.includes("trust")
      ? "conservative"
      : "balanced";

  return {
    userVision: summarizeVision(text),
    desiredTone,
    riskPosture,
    confidence: input.latestUserMessage && input.latestUserMessage.length > 80 ? "high" : "medium"
  };
}

function inferTone(text: string, fallback: string): string {
  if (text.includes("premium") || text.includes("luxury")) return "Polished, premium, calm, and trust-building.";
  if (text.includes("not pushy") || text.includes("gentle")) return "Warm, respectful, non-pushy, and helpful.";
  if (text.includes("urgent") || text.includes("fast")) return "Concise, practical, and action-oriented without pressure.";
  if (text.includes("friendly") || text.includes("warm")) return "Friendly, reassuring, and human.";
  return fallback;
}

function summarizeVision(text: string): string {
  if (text.includes("abandoned") || text.includes("cart")) {
    return "Recover qualified abandoned carts by helping customers complete purchase decisions without sounding pushy.";
  }
  if (text.includes("appointment") || text.includes("demo") || text.includes("booking")) {
    return "Qualify interest and book a concrete next step while keeping the call efficient.";
  }
  if (text.includes("support") || text.includes("ticket")) {
    return "Resolve or triage customer issues with accurate knowledge and clean escalation.";
  }
  return "Create a reliable voice agent that understands the business goal, uses approved context, and produces measurable outcomes.";
}

function scorePrompt(checks: PromptQualityCheck[], selfTests: PromptSelfTest[]): number {
  const qualityPoints = checks.reduce((sum, checkItem) => sum + statusPoints(checkItem.status), 0);
  const testPoints = selfTests.reduce((sum, test) => sum + statusPoints(test.status), 0);
  const max = checks.length * 2 + selfTests.length * 2;
  return Math.round(((qualityPoints + testPoints) / max) * 100);
}

function statusPoints(status: PromptQualityStatus): number {
  if (status === "pass") return 2;
  if (status === "warn") return 1;
  return 0;
}

function check(criterion: string, passed: boolean, detail: string): PromptQualityCheck {
  return {
    criterion,
    status: passed ? "pass" : "fail",
    detail
  };
}

function describeVariable(variable: AgentVariable): string {
  const flags = [
    variable.sensitive ? "sensitive" : "not sensitive",
    variable.speakable ? "speakable" : "do not speak aloud",
    variable.writable ? "writable" : "read-only"
  ].join(", ");
  return `${variable.name} (${variable.type}, ${variable.source}, ${flags})`;
}
