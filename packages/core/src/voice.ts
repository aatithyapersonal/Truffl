export type VoiceProviderName = "plivo" | "twilio" | "mock";

export type VoiceCallRequest = {
  brandId: string;
  journeyRunId: string;
  provider: VoiceProviderName;
  toPhoneE164: string;
  fromPhoneE164?: string;
  market: string;
  handoffEnabled: boolean;
};

export type VoiceCallResult = {
  provider: VoiceProviderName;
  providerCallId: string;
  status: "queued" | "started" | "failed";
  message: string;
};

export interface VoiceProviderAdapter {
  provider: VoiceProviderName;
  placeCall(request: VoiceCallRequest): Promise<VoiceCallResult>;
}
