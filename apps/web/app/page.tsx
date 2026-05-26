"use client";

import {
  BarChart3,
  Bot,
  CheckCircle2,
  CircleAlert,
  ClipboardCheck,
  Database,
  FileUp,
  Gauge,
  FileText,
  ListChecks,
  MessageSquare,
  Mic,
  PhoneCall,
  PlayCircle,
  Send,
  Sparkles,
  Table2,
  Wrench
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import {
  applyBuilderMessage,
  applyUploadedDataPreview,
  createInitialAgentBuilderDraft,
  type AgentBuilderDraft,
  type UploadedDataPreview
} from "@truffl/core";

const taskLabels: Record<AgentBuilderDraft["tasks"][number]["status"], string> = {
  done: "Done",
  active: "Active",
  blocked: "Blocked",
  queued: "Queued"
};

export default function Home() {
  const [draft, setDraft] = useState<AgentBuilderDraft>(() => createInitialAgentBuilderDraft());
  const [message, setMessage] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [chatMode, setChatMode] = useState<"llm" | "local">("llm");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const requiredFields = useMemo(() => draft.contactSchema.filter((field) => field.required), [draft.contactSchema]);
  const mappedRequiredFields = requiredFields.filter((field) => field.status === "mapped");
  const blockedTasks = draft.tasks.filter((task) => task.status === "blocked").length;

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = message.trim();
    if (!content) return;

    setMessage("");
    setIsSending(true);

    if (apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/api/agent-builder/${draft.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content })
        });

        if (response.ok) {
          setDraft((await response.json()) as AgentBuilderDraft);
          setChatMode("llm");
          setIsSending(false);
          return;
        }
      } catch {
        // The local compiler keeps the product usable if the API or LLM is unavailable.
      }
    }

    setDraft((current) => applyBuilderMessage(current, content));
    setChatMode("local");
    setIsSending(false);
  }

  async function handleUpload(file?: File) {
    if (!file) return;
    setIsUploading(true);
    const preview = await buildUploadPreview(file);
    setDraft((current) => applyUploadedDataPreview(current, preview));
    setIsUploading(false);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <span className="brand-dot" />
          <div>
            <strong>Truffl</strong>
            <span>Agent Builder</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary">
          <button className="nav-item active" type="button">
            <MessageSquare size={18} />
            Builder
          </button>
          <button className="nav-item" type="button">
            <Database size={18} />
            Data
          </button>
          <button className="nav-item" type="button">
            <PlayCircle size={18} />
            Tests
          </button>
          <button className="nav-item" type="button">
            <BarChart3 size={18} />
            Analytics
          </button>
        </nav>
      </aside>

      <section className="chat-panel">
        <header className="section-header">
          <p>Conversational setup</p>
          <h1>{draft.title}</h1>
        </header>

        <div className="message-list">
          {draft.messages.map((item, index) => (
            <div className={`message ${item.role}`} key={`${item.createdAt}-${index}`}>
              <span>{item.role === "user" ? "You" : "Truffl"}</span>
              <p>{item.content}</p>
            </div>
          ))}
        </div>

        <form className="composer" onSubmit={submitMessage}>
          <input
            aria-label="Voice agent request"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Build a voice agent for abandoned carts, appointment booking, support follow-up..."
          />
          <button aria-label="Send message" disabled={isSending} type="submit">
            <Send size={18} />
          </button>
        </form>
      </section>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p>Core product slice</p>
            <h2>Live Agent Compiler</h2>
          </div>
          <div className="topbar-actions">
            <span className="status-pill">
              <Sparkles size={16} />
              {chatMode === "llm" ? "LLM chat path" : "Local fallback"}
            </span>
            <span className="status-pill muted">
              <CircleAlert size={16} />
              {blockedTasks} blocked
            </span>
          </div>
        </header>

        <div className="canvas-grid">
          <SummaryCard
            icon={Bot}
            title="Agent Spec"
            value={draft.agentSpec.role}
            detail={draft.agentSpec.goal}
          />
          <SummaryCard
            icon={Table2}
            title="Variables"
            value={`${draft.variables.length} fields`}
            detail="Custom variables can come from chat, upload, connector data, tools, or agent-collected answers."
          />
          <SummaryCard
            icon={Database}
            title="Data Intake"
            value={`${mappedRequiredFields.length}/${requiredFields.length} required mapped`}
            detail="CSV, sheets, PDFs, JSON, and manual lists can seed a simulated call queue before connectors exist."
          />
          <SummaryCard
            icon={Mic}
            title="Voice Runtime"
            value={draft.providerPlan.telephony}
            detail={`${draft.providerPlan.stt}; ${draft.providerPlan.tts}.`}
          />
          <SummaryCard
            icon={PlayCircle}
            title="Tests"
            value={`${draft.tests.length} scenarios`}
            detail="Happy paths, handoffs, data gaps, objections, compliance, and failure cases are generated as part of the build."
          />
          <SummaryCard
            icon={Gauge}
            title="Analytics"
            value="Modeled"
            detail="Calls, recordings, transcripts, outcomes, conversion, QA, and improvement signals are part of the spec."
          />
        </div>

        <div className="work-grid">
          <section className="work-section prompt-studio">
            <div className="prompt-header">
              <SectionTitle icon={FileText} title="System Prompt Studio" />
              <strong>{draft.systemPromptWorkbench.score}/100</strong>
            </div>
            <div className="prompt-meta">
              <span>{draft.systemPromptWorkbench.sentiment.desiredTone}</span>
              <span>{draft.systemPromptWorkbench.sentiment.riskPosture}</span>
              <span>{draft.systemPromptWorkbench.sentiment.confidence} confidence</span>
            </div>
            <pre>{draft.systemPromptWorkbench.prompt}</pre>
          </section>

          <section className="work-section">
            <SectionTitle icon={PhoneCall} title="Opening + Call States" />
            <div className="agent-copy">
              <blockquote>{draft.agentSpec.openingScript}</blockquote>
            </div>
            <div className="chip-row">
              {draft.agentSpec.stateMachine.map((state) => (
                <span className="chip" key={state}>
                  {state.replaceAll("_", " ")}
                </span>
              ))}
            </div>
          </section>

          <section className="work-section">
            <SectionTitle icon={ListChecks} title="Prompt Quality Checks" />
            <ul className="quality-list">
              {draft.systemPromptWorkbench.qualityChecks.map((check) => (
                <li className={check.status} key={check.criterion}>
                  <strong>{check.criterion}</strong>
                  <span>{check.detail}</span>
                  <em>{check.status}</em>
                </li>
              ))}
            </ul>
          </section>

          <section className="work-section">
            <SectionTitle icon={PlayCircle} title="Prompt Self-Tests" />
            <ul className="quality-list">
              {draft.systemPromptWorkbench.selfTests.map((test) => (
                <li className={test.status} key={test.title}>
                  <strong>{test.title}</strong>
                  <span>{test.expectedBehavior}</span>
                  <em>{test.status}</em>
                </li>
              ))}
            </ul>
          </section>

          <section className="work-section">
            <SectionTitle icon={Sparkles} title="Prompt Improvements" />
            <ul className="stack-list">
              {draft.systemPromptWorkbench.improvementLog.map((item) => (
                <li key={item}>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="work-section">
            <SectionTitle icon={FileUp} title="Upload Customer Data" />
            <label className="upload-box">
              <input
                accept=".csv,.tsv,.txt,.json,.pdf,.xlsx,.xls"
                disabled={isUploading}
                onChange={(event) => void handleUpload(event.target.files?.[0])}
                type="file"
              />
              <FileUp size={20} />
              <span>{isUploading ? "Inspecting file..." : "Choose CSV, sheet, PDF, JSON, or text"}</span>
            </label>
            <ul className="field-list">
              {draft.contactSchema.map((field) => (
                <li className={field.status} key={field.name}>
                  <span>{field.name}</span>
                  <strong>{field.mappedFrom ?? field.status}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="work-section wide">
            <SectionTitle icon={ClipboardCheck} title="Agent Component Readiness" />
            <div className="readiness-grid">
              {draft.componentAssessments.map((component) => (
                <article className={component.readiness} key={component.componentId}>
                  <div>
                    <strong>{component.title}</strong>
                    <span>{component.category.replaceAll("_", " ")}</span>
                  </div>
                  <p>{component.nextAction}</p>
                  {component.missingInputs.length > 0 ? <em>{component.missingInputs.join(", ")}</em> : null}
                </article>
              ))}
            </div>
          </section>

          <section className="work-section">
            <SectionTitle icon={Table2} title="Custom Variables" />
            <ul className="variable-list">
              {draft.variables.map((variable) => (
                <li key={variable.name}>
                  <div>
                    <strong>{variable.name}</strong>
                    <span>{variable.description}</span>
                  </div>
                  <em>{variable.type}</em>
                </li>
              ))}
            </ul>
          </section>

          <section className="work-section">
            <SectionTitle icon={Database} title="Knowledge Plan" />
            <ul className="stack-list">
              {draft.knowledgeSources.map((source) => (
                <li key={source.id}>
                  <strong>{source.title}</strong>
                  <span>{source.detail}</span>
                  <em>{source.status.replaceAll("_", " ")}</em>
                </li>
              ))}
            </ul>
          </section>

          <section className="work-section">
            <SectionTitle icon={Wrench} title="Tools" />
            <ul className="stack-list">
              {draft.tools.map((tool) => (
                <li key={tool.name}>
                  <strong>{tool.name}</strong>
                  <span>{tool.description}</span>
                  <em>{tool.status.replaceAll("_", " ")}</em>
                </li>
              ))}
            </ul>
          </section>

          <section className="work-section">
            <SectionTitle icon={ListChecks} title="Builder Tasks" />
            <ul className="task-list">
              {draft.tasks.map((task) => (
                <li className={task.status} key={task.label}>
                  <CheckCircle2 size={16} />
                  <span>{task.label}</span>
                  <strong>{taskLabels[task.status]}</strong>
                </li>
              ))}
            </ul>
          </section>

          <section className="work-section">
            <SectionTitle icon={PlayCircle} title="Test Scenarios" />
            <ul className="stack-list">
              {draft.tests.map((test) => (
                <li key={test.title}>
                  <strong>{test.title}</strong>
                  <span>{test.expectedOutcome}</span>
                  <em>{test.type.replaceAll("_", " ")}</em>
                </li>
              ))}
            </ul>
          </section>

          <section className="work-section">
            <SectionTitle icon={BarChart3} title="Analytics + Recordings" />
            <div className="metric-grid">
              {draft.analytics.map((metric) => (
                <article key={metric.label}>
                  <span>{metric.label}</span>
                  <strong>{metric.value}</strong>
                  <p>{metric.detail}</p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  detail,
  icon: Icon,
  title,
  value
}: {
  detail: string;
  icon: React.ComponentType<{ size?: number }>;
  title: string;
  value: string;
}) {
  return (
    <article className="panel">
      <div className="panel-title">
        <Icon size={20} />
        <h3>{title}</h3>
      </div>
      <strong>{value}</strong>
      <p>{detail}</p>
    </article>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: React.ComponentType<{ size?: number }>; title: string }) {
  return (
    <div className="detail-heading">
      <Icon size={18} />
      <h3>{title}</h3>
    </div>
  );
}

async function buildUploadPreview(file: File): Promise<UploadedDataPreview> {
  const base: UploadedDataPreview = {
    fileName: file.name,
    fileType: file.type || file.name.split(".").pop() || "unknown",
    columns: []
  };

  if (!/\.(csv|tsv|txt|json)$/i.test(file.name)) {
    return base;
  }

  const text = await file.text();
  const lines = text.split(/\r?\n/).filter(Boolean);
  const firstLine = lines[0] ?? "";
  const delimiter = firstLine.includes("\t") ? "\t" : ",";
  return {
    ...base,
    columns: firstLine
      .split(delimiter)
      .map((column) => column.trim().replace(/^"|"$/g, ""))
      .filter(Boolean),
    rowCount: Math.max(0, lines.length - 1)
  };
}
