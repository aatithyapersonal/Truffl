export type AgentComponentCategory =
  | "goal"
  | "audience"
  | "data"
  | "variables"
  | "knowledge"
  | "conversation"
  | "guardrails"
  | "tools"
  | "voice_runtime"
  | "testing"
  | "analytics"
  | "deployment";

export type ComponentReadiness = "ready" | "needs_input" | "simulated" | "blocked";

export type AgentComponentDefinition = {
  id: string;
  category: AgentComponentCategory;
  title: string;
  description: string;
  whyItMatters: string;
  minimumInputs: string[];
  advancedInputs: string[];
  outputArtifacts: string[];
};

export type AgentComponentAssessment = {
  componentId: string;
  category: AgentComponentCategory;
  title: string;
  readiness: ComponentReadiness;
  summary: string;
  missingInputs: string[];
  nextAction: string;
};

export const agentComponentCatalog: AgentComponentDefinition[] = [
  {
    id: "business_goal",
    category: "goal",
    title: "Business Goal",
    description: "The commercial or operational outcome the voice agent should drive.",
    whyItMatters: "Without a precise goal, the agent cannot choose the right questions, CTA, metrics, or handoff rules.",
    minimumInputs: ["Primary use case", "Desired outcome", "Success event"],
    advancedInputs: ["Secondary goals", "Revenue target", "Allowed tradeoffs", "Failure definition"],
    outputArtifacts: ["Use case brief", "Success criteria", "Outcome taxonomy"]
  },
  {
    id: "audience_context",
    category: "audience",
    title: "Audience Context",
    description: "Who the agent is calling and what they likely know before the call.",
    whyItMatters: "A new buyer, warm lead, support ticket, and repeat customer need different openings and boundaries.",
    minimumInputs: ["Audience segment", "Why they are being contacted", "Known customer context"],
    advancedInputs: ["Language preference", "Purchase history", "Lead stage", "Risk/sensitivity level"],
    outputArtifacts: ["Audience brief", "Opening context", "Personalization rules"]
  },
  {
    id: "contact_data",
    category: "data",
    title: "Contact Data",
    description: "The uploaded or connected list of people the agent can call or follow up with.",
    whyItMatters: "The agent cannot operate without valid contact fields and use-case-specific context.",
    minimumInputs: ["Name", "Phone number", "Use-case-specific fields"],
    advancedInputs: ["Country", "Language", "Timezone", "Owner", "Consent status", "Fallback channels"],
    outputArtifacts: ["Contact schema", "Field mapping", "Data validation report", "Call queue"]
  },
  {
    id: "custom_variables",
    category: "variables",
    title: "Custom Variables",
    description: "Structured values the agent can read, say, collect, compute, write, or report on.",
    whyItMatters: "Variables turn a generic script into a configurable agent that can work across many workflows.",
    minimumInputs: ["Variable name", "Type", "Source", "Required/optional"],
    advancedInputs: ["Validation", "Sensitivity", "Speakability", "Write permission", "Analytics inclusion"],
    outputArtifacts: ["Variable schema", "Validation rules", "Prompt interpolation map"]
  },
  {
    id: "knowledgebase",
    category: "knowledge",
    title: "Knowledgebase",
    description: "Approved facts, policies, pages, files, FAQs, and notes the agent can rely on.",
    whyItMatters: "Voice agents fail when they improvise. Knowledge needs source tracking, retrieval, and safe fallback.",
    minimumInputs: ["User-provided notes", "Website or files", "Policy sources"],
    advancedInputs: ["Source confidence", "Conflict handling", "Freshness", "Citation/debug view"],
    outputArtifacts: ["Knowledge plan", "Source list", "Retrieval chunks", "Missing knowledge questions"]
  },
  {
    id: "conversation_design",
    category: "conversation",
    title: "Conversation Design",
    description: "The script, state machine, objections, CTA, fallback paths, and closing behavior.",
    whyItMatters: "A good prompt is not enough. The agent needs call flow and recovery paths for real conversations.",
    minimumInputs: ["Opening", "Core pitch", "Questions", "CTA", "Closing"],
    advancedInputs: ["Objections", "Silence handling", "Voicemail", "Interruption handling", "Wrong-number flow"],
    outputArtifacts: ["Script", "State machine", "Objection library", "Call outcome map"]
  },
  {
    id: "guardrails",
    category: "guardrails",
    title: "Guardrails",
    description: "What the agent can say, cannot say, must disclose, and must escalate.",
    whyItMatters: "Guardrails protect brand trust, privacy, compliance, and customer experience.",
    minimumInputs: ["Forbidden claims", "Allowed offers", "Opt-out handling", "Escalation rules"],
    advancedInputs: ["Compliance jurisdiction", "Sensitive data rules", "Review flags", "QA scoring rubric"],
    outputArtifacts: ["Policy prompt", "Safety rules", "Escalation triggers", "Review checklist"]
  },
  {
    id: "tools",
    category: "tools",
    title: "Tools And Actions",
    description: "Functions the agent can call to retrieve data, send links, update records, or hand off.",
    whyItMatters: "Tools are how the voice agent becomes operational instead of only conversational.",
    minimumInputs: ["Tool purpose", "Permission", "Inputs", "Failure behavior"],
    advancedInputs: ["Audit events", "Retries", "Rate limits", "Approval gates", "Fallback providers"],
    outputArtifacts: ["Tool manifest", "Permission model", "Error handling plan"]
  },
  {
    id: "voice_runtime",
    category: "voice_runtime",
    title: "Voice Runtime",
    description: "Telephony, STT, LLM, TTS, recording, latency, interruption, and language choices.",
    whyItMatters: "Runtime quality determines whether the agent feels useful in a real phone call.",
    minimumInputs: ["Telephony mode", "LLM", "STT/TTS or realtime model", "Recording setting"],
    advancedInputs: ["Latency target", "Barge-in", "Noise handling", "Accent/language support", "Provider fallback"],
    outputArtifacts: ["Provider plan", "Runtime config", "Recording/transcript policy"]
  },
  {
    id: "test_suite",
    category: "testing",
    title: "Test Suite",
    description: "Simulated calls and edge cases that prove the agent behaves safely before launch.",
    whyItMatters: "Every generated agent should be tested before it is trusted with real customers.",
    minimumInputs: ["Happy path", "Bad data", "Objection", "Handoff", "Opt-out"],
    advancedInputs: ["A/B prompts", "Compliance tests", "Regression suite", "Golden transcripts"],
    outputArtifacts: ["Test scenarios", "Expected outcomes", "Simulation results"]
  },
  {
    id: "analytics_recordings",
    category: "analytics",
    title: "Analytics And Recordings",
    description: "Call metrics, outcomes, transcripts, recordings, QA, attribution, and improvement signals.",
    whyItMatters: "Users need to see if the agent works, why it works, and how to improve it.",
    minimumInputs: ["Outcome labels", "Call events", "Transcript capture", "Retention policy"],
    advancedInputs: ["Objection categories", "Quality scoring", "A/B tests", "Revenue attribution", "Cohorts"],
    outputArtifacts: ["Analytics plan", "Recording policy", "Outcome schema", "QA dashboard"]
  },
  {
    id: "deployment",
    category: "deployment",
    title: "Deployment",
    description: "The rollout plan, simulated/live mode, credentials, channels, and launch gates.",
    whyItMatters: "Deployment separates testable configuration from real-world side effects like calling customers.",
    minimumInputs: ["Mode", "Provider readiness", "Call list", "Review approval"],
    advancedInputs: ["Rollout percentage", "Quiet hours", "Market routing", "Monitoring", "Rollback plan"],
    outputArtifacts: ["Deployment checklist", "Launch gates", "Blocked items", "Rollback plan"]
  }
];

export function assessAgentComponents(input: {
  hasUseCase: boolean;
  variableCount: number;
  requiredFields: number;
  mappedRequiredFields: number;
  knowledgeSourceCount: number;
  toolCount: number;
  testCount: number;
  analyticsMetricCount: number;
  liveProviderReady: boolean;
}): AgentComponentAssessment[] {
  return agentComponentCatalog.map((component) => {
    if (component.category === "goal") {
      return assessment(component, input.hasUseCase ? "ready" : "needs_input", input.hasUseCase ? [] : ["Primary use case"], "Describe the business outcome in one sentence.");
    }

    if (component.category === "data") {
      const missing = input.requiredFields - input.mappedRequiredFields;
      return assessment(
        component,
        missing === 0 && input.requiredFields > 0 ? "ready" : "needs_input",
        missing > 0 ? [`${missing} required fields unmapped`] : [],
        "Upload customer data or map required fields."
      );
    }

    if (component.category === "variables") {
      return assessment(component, input.variableCount >= 4 ? "ready" : "needs_input", input.variableCount >= 4 ? [] : ["At least 4 starter variables"], "Infer or add custom variables.");
    }

    if (component.category === "knowledge") {
      return assessment(component, input.knowledgeSourceCount > 1 ? "simulated" : "needs_input", input.knowledgeSourceCount > 1 ? [] : ["Website/files/policies"], "Add URLs, PDFs, FAQs, or manual notes.");
    }

    if (component.category === "tools") {
      return assessment(component, input.toolCount >= 3 ? "simulated" : "needs_input", [], "Keep tools simulated until providers are connected.");
    }

    if (component.category === "testing") {
      return assessment(component, input.testCount >= 3 ? "ready" : "needs_input", [], "Generate happy-path and edge-case call tests.");
    }

    if (component.category === "analytics") {
      return assessment(component, input.analyticsMetricCount >= 4 ? "ready" : "needs_input", [], "Track calls, outcomes, transcripts, recordings, and quality.");
    }

    if (component.category === "deployment" || component.category === "voice_runtime") {
      return assessment(
        component,
        input.liveProviderReady ? "ready" : "simulated",
        input.liveProviderReady ? [] : ["Live provider credentials intentionally deferred"],
        "Use simulator now; connect providers behind adapters later."
      );
    }

    return assessment(component, "ready", [], "Review and refine with the user.");
  });
}

function assessment(
  component: AgentComponentDefinition,
  readiness: ComponentReadiness,
  missingInputs: string[],
  nextAction: string
): AgentComponentAssessment {
  return {
    componentId: component.id,
    category: component.category,
    title: component.title,
    readiness,
    summary: component.whyItMatters,
    missingInputs,
    nextAction
  };
}
