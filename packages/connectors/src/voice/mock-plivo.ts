import type { VoiceCallRequest, VoiceCallResult, VoiceProviderAdapter } from "@truffl/core";

export class MockPlivoAdapter implements VoiceProviderAdapter {
  provider = "plivo" as const;

  async placeCall(request: VoiceCallRequest): Promise<VoiceCallResult> {
    return {
      provider: this.provider,
      providerCallId: `mock_plivo_${request.journeyRunId}`,
      status: "queued",
      message: `Mock Plivo call queued to ${request.toPhoneE164}. Replace this adapter with live Plivo credentials before pilot traffic.`
    };
  }
}
