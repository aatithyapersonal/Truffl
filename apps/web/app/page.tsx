"use client";

import {
  Activity,
  Bot,
  CheckCircle2,
  CircleAlert,
  GitBranch,
  Handshake,
  IndianRupee,
  MessageSquare,
  PhoneCall,
  Plug,
  Send,
  ShieldCheck
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import {
  applyMerchantMessage,
  createInitialHighAovDraft,
  formatMoneyThreshold,
  type JourneyDraft,
  type VisualFeedback
} from "@truffl/core";

const panelIcons: Record<VisualFeedback["panel"], React.ComponentType<{ size?: number }>> = {
  journey_setup: GitBranch,
  voice_agent: PhoneCall,
  store_connector: Plug,
  operations: Activity,
  revenue: IndianRupee,
  compliance: ShieldCheck,
  debug: Bot
};

export default function Home() {
  const [draft, setDraft] = useState<JourneyDraft>(() => createInitialHighAovDraft());
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const configuredPanels = useMemo(
    () => draft.visualFeedback.filter((item) => item.status === "configured").length,
    [draft.visualFeedback]
  );

  async function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const content = message.trim();
    if (!content) return;

    setIsSending(true);
    setMessage("");

    if (apiUrl) {
      try {
        const response = await fetch(`${apiUrl}/api/journey-drafts/${draft.id}/messages`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ content })
        });

        if (response.ok) {
          setDraft((await response.json()) as JourneyDraft);
          setIsSending(false);
          return;
        }
      } catch {
        // Local fallback keeps the dashboard usable before the API is running.
      }
    }

    setDraft((current) => applyMerchantMessage(current, content));
    setIsSending(false);
  }

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand-mark">
          <span className="brand-dot" />
          <div>
            <strong>Truffl</strong>
            <span>Voice OS</span>
          </div>
        </div>

        <nav className="nav-list" aria-label="Primary">
          <button className="nav-item active" type="button">
            <MessageSquare size={18} />
            Setup
          </button>
          <button className="nav-item" type="button">
            <PhoneCall size={18} />
            Calls
          </button>
          <button className="nav-item" type="button">
            <Activity size={18} />
            Queue
          </button>
          <button className="nav-item" type="button">
            <ShieldCheck size={18} />
            Review
          </button>
        </nav>
      </aside>

      <section className="chat-panel">
        <header className="section-header">
          <p>Journey draft</p>
          <h1>{draft.title}</h1>
        </header>

        <div className="message-list">
          {draft.messages.map((item, index) => (
            <div className={`message ${item.role}`} key={`${item.createdAt}-${index}`}>
              <span>{item.role === "merchant" ? "Merchant" : "Truffl"}</span>
              <p>{item.content}</p>
            </div>
          ))}
        </div>

        <form className="composer" onSubmit={submitMessage}>
          <input
            aria-label="Journey request"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="India first, Plivo calls, 3 month retention, human handoff..."
          />
          <button aria-label="Send message" disabled={isSending} type="submit">
            <Send size={18} />
          </button>
        </form>
      </section>

      <section className="workspace">
        <header className="topbar">
          <div>
            <p>High-AOV New Buyer</p>
            <h2>Configuration canvas</h2>
          </div>
          <div className="publish-state">
            <CheckCircle2 size={18} />
            {configuredPanels} configured
          </div>
        </header>

        <div className="canvas-grid">
          {draft.visualFeedback.map((panel) => {
            const Icon = panelIcons[panel.panel];
            return (
              <article className={`panel ${panel.status}`} key={panel.panel}>
                <div className="panel-title">
                  <Icon size={20} />
                  <h3>{panel.title}</h3>
                </div>
                <p>{panel.detail}</p>
              </article>
            );
          })}
        </div>

        <div className="detail-grid">
          <section className="detail-section">
            <div className="detail-heading">
              <GitBranch size={18} />
              <h3>Rules</h3>
            </div>
            <dl>
              <div>
                <dt>Market</dt>
                <dd>{draft.config.market.primaryCountry}</dd>
              </div>
              <div>
                <dt>Threshold</dt>
                <dd>{draft.config.eligibility.thresholds.map(formatMoneyThreshold).join(" / ")}</dd>
              </div>
              <div>
                <dt>Wait</dt>
                <dd>{draft.config.eligibility.waitMinutes} min</dd>
              </div>
              <div>
                <dt>No phone</dt>
                <dd>{draft.config.eligibility.fallbackWhenNoPhone}</dd>
              </div>
            </dl>
          </section>

          <section className="detail-section">
            <div className="detail-heading">
              <Handshake size={18} />
              <h3>Handoff</h3>
            </div>
            <dl>
              <div>
                <dt>Telephony</dt>
                <dd>{draft.config.voice.primaryTelephonyProvider}</dd>
              </div>
              <div>
                <dt>Global</dt>
                <dd>{draft.config.voice.globalTelephonyProvider}</dd>
              </div>
              <div>
                <dt>Retention</dt>
                <dd>{draft.config.voice.recordingRetentionDays} days</dd>
              </div>
              <div>
                <dt>Human</dt>
                <dd>{draft.config.voice.humanHandoff.join(" + ")}</dd>
              </div>
            </dl>
          </section>

          <section className="detail-section warnings">
            <div className="detail-heading">
              <CircleAlert size={18} />
              <h3>Review</h3>
            </div>
            <ul>
              {draft.validationIssues.map((issue) => (
                <li key={issue.title}>
                  <strong>{issue.title}</strong>
                  <span>{issue.detail}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
