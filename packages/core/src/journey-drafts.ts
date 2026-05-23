export type CurrencyCode = "INR" | "USD" | "EUR" | "GBP" | string;

export type MoneyThreshold = {
  currency: CurrencyCode;
  amountMinor: number;
};

export type JourneyMode = "draft" | "ready_for_test" | "published";

export type HandoffMode = "telephony" | "crm_ops";

export type JourneyConfig = {
  journeyId: "high_aov_new_buyer";
  market: {
    primaryCountry: string;
    supportedCountries: string[];
    timezone: string;
    currencies: CurrencyCode[];
  };
  eligibility: {
    waitMinutes: number;
    thresholds: MoneyThreshold[];
    productAgnostic: true;
    firstTimeBuyerOnly: boolean;
    requirePhoneForCall: boolean;
    fallbackWhenNoPhone: "whatsapp" | "email" | "suppress";
  };
  voice: {
    primaryTelephonyProvider: "plivo" | "twilio" | "mock";
    globalTelephonyProvider: "twilio" | "mock";
    aiDisclosure: "off_by_default" | "on" | "market_configured";
    recordingRetentionDays: number;
    humanHandoff: HandoffMode[];
  };
  whatsapp: {
    ownershipModes: Array<"truffl_managed" | "merchant_owned">;
    activeMode: "truffl_managed" | "merchant_owned" | "not_configured";
  };
  crm: {
    handoffEnabled: boolean;
    firstSink: "google_sheets" | "hubspot" | "zoho" | "not_configured";
  };
};

export type JourneyDraft = {
  id: string;
  brandId: string;
  mode: JourneyMode;
  title: string;
  summary: string;
  messages: DraftMessage[];
  config: JourneyConfig;
  visualFeedback: VisualFeedback[];
  validationIssues: ValidationIssue[];
  updatedAt: string;
};

export type DraftMessage = {
  role: "merchant" | "truffl";
  content: string;
  createdAt: string;
};

export type VisualFeedback = {
  panel: "journey_setup" | "voice_agent" | "store_connector" | "operations" | "revenue" | "compliance" | "debug";
  title: string;
  status: "configured" | "needs_input" | "preview";
  detail: string;
};

export type ValidationIssue = {
  severity: "info" | "warning" | "blocker";
  title: string;
  detail: string;
};

export function createInitialHighAovDraft(brandId = "brand_demo"): JourneyDraft {
  const now = new Date().toISOString();

  return {
    id: "draft_high_aov_new_buyer",
    brandId,
    mode: "draft",
    title: "High-AOV New Buyer Recovery",
    summary: "Recover high-value first-time buyer carts through AI voice, handoff, WhatsApp, and CRM follow-up.",
    messages: [
      {
        role: "truffl",
        content:
          "Tell me what kind of abandoned-cart journey you want. I will turn it into rules, voice behavior, handoff logic, and operational previews.",
        createdAt: now
      }
    ],
    config: {
      journeyId: "high_aov_new_buyer",
      market: {
        primaryCountry: "IN",
        supportedCountries: ["IN"],
        timezone: "Asia/Kolkata",
        currencies: ["INR"]
      },
      eligibility: {
        waitMinutes: 30,
        thresholds: [{ currency: "INR", amountMinor: 1000000 }],
        productAgnostic: true,
        firstTimeBuyerOnly: true,
        requirePhoneForCall: true,
        fallbackWhenNoPhone: "whatsapp"
      },
      voice: {
        primaryTelephonyProvider: "plivo",
        globalTelephonyProvider: "twilio",
        aiDisclosure: "off_by_default",
        recordingRetentionDays: 90,
        humanHandoff: ["telephony", "crm_ops"]
      },
      whatsapp: {
        ownershipModes: ["truffl_managed", "merchant_owned"],
        activeMode: "not_configured"
      },
      crm: {
        handoffEnabled: true,
        firstSink: "google_sheets"
      }
    },
    visualFeedback: buildVisualFeedback(),
    validationIssues: buildValidationIssues(),
    updatedAt: now
  };
}

export function applyMerchantMessage(draft: JourneyDraft, content: string): JourneyDraft {
  const now = new Date().toISOString();
  const nextConfig = structuredClone(draft.config);
  const normalized = content.toLowerCase();

  if (normalized.includes("usd") || normalized.includes("global")) {
    nextConfig.market.supportedCountries = unique([...nextConfig.market.supportedCountries, "US"]);
    nextConfig.market.currencies = unique([...nextConfig.market.currencies, "USD"]);
    if (!nextConfig.eligibility.thresholds.some((threshold) => threshold.currency === "USD")) {
      nextConfig.eligibility.thresholds.push({ currency: "USD", amountMinor: 15000 });
    }
  }

  if (normalized.includes("india") || normalized.includes("inr") || normalized.includes("plivo")) {
    nextConfig.market.primaryCountry = "IN";
    nextConfig.market.timezone = "Asia/Kolkata";
    nextConfig.voice.primaryTelephonyProvider = "plivo";
  }

  if (normalized.includes("twilio")) {
    nextConfig.voice.globalTelephonyProvider = "twilio";
  }

  if (normalized.includes("no disclosure") || normalized.includes("without disclosure")) {
    nextConfig.voice.aiDisclosure = "off_by_default";
  }

  if (normalized.includes("handoff") || normalized.includes("human")) {
    nextConfig.voice.humanHandoff = ["telephony", "crm_ops"];
    nextConfig.crm.handoffEnabled = true;
  }

  if (normalized.includes("3 month") || normalized.includes("90 day")) {
    nextConfig.voice.recordingRetentionDays = 90;
  }

  const nextDraft: JourneyDraft = {
    ...draft,
    config: nextConfig,
    messages: [
      ...draft.messages,
      { role: "merchant", content, createdAt: now },
      {
        role: "truffl",
        content: summarizeConfigPatch(nextConfig),
        createdAt: now
      }
    ],
    visualFeedback: buildVisualFeedback(nextConfig),
    validationIssues: buildValidationIssues(nextConfig),
    updatedAt: now
  };

  return nextDraft;
}

export function formatMoneyThreshold(threshold: MoneyThreshold): string {
  const major = threshold.amountMinor / 100;
  return `${threshold.currency} ${major.toLocaleString("en-IN", {
    maximumFractionDigits: 0
  })}`;
}

function summarizeConfigPatch(config: JourneyConfig): string {
  const thresholds = config.eligibility.thresholds.map(formatMoneyThreshold).join(", ");

  return `Updated the draft: ${config.market.primaryCountry} first, ${thresholds} High-AOV thresholds, ${config.voice.primaryTelephonyProvider} for India calls, ${config.voice.globalTelephonyProvider} for broader coverage, ${config.voice.recordingRetentionDays} day voice retention, and ${config.voice.humanHandoff.join(" + ")} handoff.`;
}

function buildVisualFeedback(config = createConfigOnly()): VisualFeedback[] {
  return [
    {
      panel: "journey_setup",
      title: "High-AOV New Buyer",
      status: "configured",
      detail: `Calls eligible first-time buyers after ${config.eligibility.waitMinutes} minutes if cart value matches ${config.eligibility.thresholds.map(formatMoneyThreshold).join(" or ")}.`
    },
    {
      panel: "voice_agent",
      title: "Voice Core",
      status: "configured",
      detail: `${config.voice.primaryTelephonyProvider} for India, ${config.voice.globalTelephonyProvider} for global expansion, AI disclosure ${config.voice.aiDisclosure.replaceAll("_", " ")}.`
    },
    {
      panel: "store_connector",
      title: "Store Connector",
      status: "needs_input",
      detail: "Shopify development store is not connected yet. Custom store and WooCommerce contracts are modeled but not active."
    },
    {
      panel: "operations",
      title: "Human Handoff",
      status: "preview",
      detail: `Handoff modes: ${config.voice.humanHandoff.join(", ")}. Hot leads will be visible in the operations queue.`
    },
    {
      panel: "revenue",
      title: "Attribution Preview",
      status: "preview",
      detail: "Recovered orders will be matched by checkout token, customer ID, email, phone, and attribution link where available."
    },
    {
      panel: "compliance",
      title: "Consent And Retention",
      status: "preview",
      detail: `Transactional outreach assumed for pilot. Recordings/transcripts retained for ${config.voice.recordingRetentionDays} days.`
    },
    {
      panel: "debug",
      title: "Draft Config API",
      status: "preview",
      detail: "Chat messages create draft config patches before anything can be published or called live."
    }
  ];
}

function buildValidationIssues(config = createConfigOnly()): ValidationIssue[] {
  const issues: ValidationIssue[] = [
    {
      severity: "warning",
      title: "No Shopify development store connected",
      detail: "Use the simulator for now. Connect Shopify once the local vertical slice is running."
    },
    {
      severity: "warning",
      title: "Plivo credentials missing",
      detail: "Real India test calls require Plivo credentials and a caller ID path."
    },
    {
      severity: "info",
      title: "WhatsApp provider not selected",
      detail: "Both Truffl-managed and merchant-owned modes are modeled; choose the first active provider later."
    }
  ];

  if (config.voice.aiDisclosure === "off_by_default") {
    issues.push({
      severity: "info",
      title: "AI disclosure off by default",
      detail: "This matches the India pilot decision and remains configurable by market."
    });
  }

  return issues;
}

function createConfigOnly(): JourneyConfig {
  return {
    journeyId: "high_aov_new_buyer",
    market: {
      primaryCountry: "IN",
      supportedCountries: ["IN"],
      timezone: "Asia/Kolkata",
      currencies: ["INR"]
    },
    eligibility: {
      waitMinutes: 30,
      thresholds: [{ currency: "INR", amountMinor: 1000000 }],
      productAgnostic: true,
      firstTimeBuyerOnly: true,
      requirePhoneForCall: true,
      fallbackWhenNoPhone: "whatsapp"
    },
    voice: {
      primaryTelephonyProvider: "plivo",
      globalTelephonyProvider: "twilio",
      aiDisclosure: "off_by_default",
      recordingRetentionDays: 90,
      humanHandoff: ["telephony", "crm_ops"]
    },
    whatsapp: {
      ownershipModes: ["truffl_managed", "merchant_owned"],
      activeMode: "not_configured"
    },
    crm: {
      handoffEnabled: true,
      firstSink: "google_sheets"
    }
  };
}

function unique<T>(values: T[]): T[] {
  return [...new Set(values)];
}
