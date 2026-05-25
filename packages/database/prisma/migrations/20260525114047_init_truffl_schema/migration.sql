-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('OWNER', 'ADMIN', 'OPERATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "ConnectorKind" AS ENUM ('SHOPIFY', 'WOOCOMMERCE', 'CUSTOM_API', 'SCRIPT_PIXEL', 'CSV_IMPORT');

-- CreateEnum
CREATE TYPE "ConnectorStatus" AS ENUM ('DRAFT', 'CONNECTED', 'DEGRADED', 'DISCONNECTED');

-- CreateEnum
CREATE TYPE "JourneyStatus" AS ENUM ('DRAFT', 'READY_FOR_TEST', 'ACTIVE', 'PAUSED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "EventSource" AS ENUM ('SHOPIFY', 'WOOCOMMERCE', 'CUSTOM_API', 'SCRIPT_PIXEL', 'CSV_IMPORT', 'SIMULATOR', 'INTERNAL', 'PLIVO', 'TWILIO', 'WHATSAPP', 'CRM');

-- CreateEnum
CREATE TYPE "CartStatus" AS ENUM ('OPEN', 'ABANDONMENT_DUE', 'ABANDONED', 'PURCHASED', 'EXPIRED', 'SUPPRESSED');

-- CreateEnum
CREATE TYPE "JourneyRunStatus" AS ENUM ('PENDING', 'SUPPRESSED', 'ELIGIBLE', 'CALLING', 'HANDOFF', 'FOLLOWUP', 'ATTRIBUTION_PENDING', 'RECOVERED', 'EXPIRED', 'FAILED');

-- CreateEnum
CREATE TYPE "CallStatus" AS ENUM ('REQUESTED', 'QUEUED', 'RINGING', 'CONNECTED', 'TRANSFERRED', 'COMPLETED', 'FAILED', 'MISSED', 'CANCELED');

-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('REQUESTED', 'SENT', 'DELIVERED', 'READ', 'FAILED');

-- CreateEnum
CREATE TYPE "ConsentChannel" AS ENUM ('VOICE', 'WHATSAPP', 'SMS', 'EMAIL');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('UNKNOWN', 'ASSUMED_TRANSACTIONAL', 'OPTED_IN', 'OPTED_OUT');

-- CreateTable
CREATE TABLE "MerchantOrganization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MerchantOrganization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrganizationUser" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrganizationUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brand" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "defaultCountry" TEXT NOT NULL DEFAULT 'IN',
    "defaultTimezone" TEXT NOT NULL DEFAULT 'Asia/Kolkata',
    "reportingCurrency" TEXT NOT NULL DEFAULT 'INR',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brand_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandMarket" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "quietHoursJson" JSONB,
    "callRulesJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandMarket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StoreConnector" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "kind" "ConnectorKind" NOT NULL,
    "status" "ConnectorStatus" NOT NULL DEFAULT 'DRAFT',
    "externalStoreId" TEXT,
    "storeDomain" TEXT,
    "capabilitiesJson" JSONB NOT NULL DEFAULT '{}',
    "secretRef" TEXT,
    "connectedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StoreConnector_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyConfig" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "JourneyStatus" NOT NULL DEFAULT 'DRAFT',
    "version" INTEGER NOT NULL DEFAULT 1,
    "configJson" JSONB NOT NULL,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyDraft" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "journeyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "configJson" JSONB NOT NULL,
    "summary" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyDraft_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConfigPatch" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "patchJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ConfigPatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SimulationRun" (
    "id" TEXT NOT NULL,
    "draftId" TEXT NOT NULL,
    "inputJson" JSONB NOT NULL,
    "resultJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SimulationRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandKnowledgeSource" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "sourceUrl" TEXT,
    "contentHash" TEXT,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandKnowledgeSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Customer" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "externalCustomerId" TEXT,
    "email" TEXT,
    "phoneE164" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "country" TEXT,
    "tagsJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Customer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConsentRecord" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "customerId" TEXT,
    "channel" "ConsentChannel" NOT NULL,
    "status" "ConsentStatus" NOT NULL DEFAULT 'UNKNOWN',
    "source" TEXT,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawJson" JSONB,

    CONSTRAINT "ConsentRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SuppressionRecord" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "customerId" TEXT,
    "reason" TEXT NOT NULL,
    "source" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuppressionRecord_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NormalizedEvent" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "connectorId" TEXT,
    "source" "EventSource" NOT NULL,
    "eventType" TEXT NOT NULL,
    "externalId" TEXT,
    "idempotencyKey" TEXT NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL,
    "receivedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payloadJson" JSONB NOT NULL,

    CONSTRAINT "NormalizedEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cart" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "customerId" TEXT,
    "externalCheckoutId" TEXT,
    "externalCartToken" TEXT,
    "recoveryUrl" TEXT,
    "status" "CartStatus" NOT NULL DEFAULT 'OPEN',
    "totalAmountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "phoneE164" TEXT,
    "email" TEXT,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cart_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CartItem" (
    "id" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "externalProductId" TEXT NOT NULL,
    "externalVariantId" TEXT,
    "title" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitAmountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "productType" TEXT,
    "tagsJson" JSONB,
    "rawJson" JSONB,

    CONSTRAINT "CartItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "customerId" TEXT,
    "externalOrderId" TEXT NOT NULL,
    "externalCheckoutId" TEXT,
    "totalAmountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "placedAt" TIMESTAMP(3) NOT NULL,
    "rawJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JourneyRun" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "journeyConfigId" TEXT NOT NULL,
    "cartId" TEXT NOT NULL,
    "status" "JourneyRunStatus" NOT NULL DEFAULT 'PENDING',
    "decisionJson" JSONB,
    "outcomeJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JourneyRun_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderAccount" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "providerKind" TEXT NOT NULL,
    "ownershipMode" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "secretRef" TEXT,
    "configJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProviderAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CallAttempt" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "journeyRunId" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerCallId" TEXT,
    "status" "CallStatus" NOT NULL DEFAULT 'REQUESTED',
    "toPhoneE164" TEXT NOT NULL,
    "fromPhoneE164" TEXT,
    "handoffRequested" BOOLEAN NOT NULL DEFAULT false,
    "handoffCompleted" BOOLEAN NOT NULL DEFAULT false,
    "recordingUrl" TEXT,
    "transcriptUrl" TEXT,
    "retentionExpiresAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CallAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VoiceSession" (
    "id" TEXT NOT NULL,
    "callAttemptId" TEXT NOT NULL,
    "runtime" TEXT NOT NULL,
    "model" TEXT,
    "stateJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VoiceSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TranscriptSegment" (
    "id" TEXT NOT NULL,
    "voiceSessionId" TEXT NOT NULL,
    "speaker" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "startedMs" INTEGER,
    "endedMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TranscriptSegment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MessageAttempt" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "journeyRunId" TEXT,
    "provider" TEXT NOT NULL,
    "ownershipMode" TEXT,
    "status" "MessageStatus" NOT NULL DEFAULT 'REQUESTED',
    "toPhoneE164" TEXT,
    "templateName" TEXT,
    "payloadJson" JSONB,
    "providerMessageId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AttributionMatch" (
    "id" TEXT NOT NULL,
    "journeyRunId" TEXT NOT NULL,
    "orderId" TEXT,
    "basis" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "matchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawJson" JSONB,

    CONSTRAINT "AttributionMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT,
    "brandId" TEXT,
    "actorEmail" TEXT,
    "action" TEXT NOT NULL,
    "subjectType" TEXT NOT NULL,
    "subjectId" TEXT,
    "metadataJson" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrganizationUser_organizationId_email_key" ON "OrganizationUser"("organizationId", "email");

-- CreateIndex
CREATE UNIQUE INDEX "BrandMarket_brandId_country_currency_key" ON "BrandMarket"("brandId", "country", "currency");

-- CreateIndex
CREATE INDEX "StoreConnector_brandId_kind_idx" ON "StoreConnector"("brandId", "kind");

-- CreateIndex
CREATE INDEX "JourneyConfig_brandId_journeyId_status_idx" ON "JourneyConfig"("brandId", "journeyId", "status");

-- CreateIndex
CREATE INDEX "Customer_brandId_email_idx" ON "Customer"("brandId", "email");

-- CreateIndex
CREATE INDEX "Customer_brandId_phoneE164_idx" ON "Customer"("brandId", "phoneE164");

-- CreateIndex
CREATE INDEX "Customer_brandId_externalCustomerId_idx" ON "Customer"("brandId", "externalCustomerId");

-- CreateIndex
CREATE INDEX "ConsentRecord_brandId_channel_status_idx" ON "ConsentRecord"("brandId", "channel", "status");

-- CreateIndex
CREATE INDEX "SuppressionRecord_brandId_reason_idx" ON "SuppressionRecord"("brandId", "reason");

-- CreateIndex
CREATE INDEX "NormalizedEvent_brandId_source_eventType_idx" ON "NormalizedEvent"("brandId", "source", "eventType");

-- CreateIndex
CREATE UNIQUE INDEX "NormalizedEvent_brandId_idempotencyKey_key" ON "NormalizedEvent"("brandId", "idempotencyKey");

-- CreateIndex
CREATE INDEX "Cart_brandId_externalCheckoutId_idx" ON "Cart"("brandId", "externalCheckoutId");

-- CreateIndex
CREATE INDEX "Cart_brandId_externalCartToken_idx" ON "Cart"("brandId", "externalCartToken");

-- CreateIndex
CREATE INDEX "Cart_brandId_status_idx" ON "Cart"("brandId", "status");

-- CreateIndex
CREATE INDEX "CartItem_cartId_idx" ON "CartItem"("cartId");

-- CreateIndex
CREATE INDEX "Order_brandId_externalCheckoutId_idx" ON "Order"("brandId", "externalCheckoutId");

-- CreateIndex
CREATE UNIQUE INDEX "Order_brandId_externalOrderId_key" ON "Order"("brandId", "externalOrderId");

-- CreateIndex
CREATE INDEX "JourneyRun_brandId_status_idx" ON "JourneyRun"("brandId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "JourneyRun_cartId_journeyConfigId_key" ON "JourneyRun"("cartId", "journeyConfigId");

-- CreateIndex
CREATE INDEX "ProviderAccount_brandId_providerKind_idx" ON "ProviderAccount"("brandId", "providerKind");

-- CreateIndex
CREATE INDEX "CallAttempt_brandId_status_idx" ON "CallAttempt"("brandId", "status");

-- CreateIndex
CREATE INDEX "CallAttempt_provider_providerCallId_idx" ON "CallAttempt"("provider", "providerCallId");

-- CreateIndex
CREATE UNIQUE INDEX "VoiceSession_callAttemptId_key" ON "VoiceSession"("callAttemptId");

-- CreateIndex
CREATE INDEX "MessageAttempt_brandId_status_idx" ON "MessageAttempt"("brandId", "status");

-- CreateIndex
CREATE INDEX "AttributionMatch_journeyRunId_idx" ON "AttributionMatch"("journeyRunId");

-- CreateIndex
CREATE INDEX "AuditLog_organizationId_action_idx" ON "AuditLog"("organizationId", "action");

-- CreateIndex
CREATE INDEX "AuditLog_brandId_action_idx" ON "AuditLog"("brandId", "action");

-- AddForeignKey
ALTER TABLE "OrganizationUser" ADD CONSTRAINT "OrganizationUser_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "MerchantOrganization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brand" ADD CONSTRAINT "Brand_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "MerchantOrganization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BrandMarket" ADD CONSTRAINT "BrandMarket_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StoreConnector" ADD CONSTRAINT "StoreConnector_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyConfig" ADD CONSTRAINT "JourneyConfig_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyDraft" ADD CONSTRAINT "JourneyDraft_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConfigPatch" ADD CONSTRAINT "ConfigPatch_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "JourneyDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SimulationRun" ADD CONSTRAINT "SimulationRun_draftId_fkey" FOREIGN KEY ("draftId") REFERENCES "JourneyDraft"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Customer" ADD CONSTRAINT "Customer_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConsentRecord" ADD CONSTRAINT "ConsentRecord_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SuppressionRecord" ADD CONSTRAINT "SuppressionRecord_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NormalizedEvent" ADD CONSTRAINT "NormalizedEvent_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NormalizedEvent" ADD CONSTRAINT "NormalizedEvent_connectorId_fkey" FOREIGN KEY ("connectorId") REFERENCES "StoreConnector"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Cart" ADD CONSTRAINT "Cart_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CartItem" ADD CONSTRAINT "CartItem_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyRun" ADD CONSTRAINT "JourneyRun_journeyConfigId_fkey" FOREIGN KEY ("journeyConfigId") REFERENCES "JourneyConfig"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JourneyRun" ADD CONSTRAINT "JourneyRun_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "Cart"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallAttempt" ADD CONSTRAINT "CallAttempt_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallAttempt" ADD CONSTRAINT "CallAttempt_journeyRunId_fkey" FOREIGN KEY ("journeyRunId") REFERENCES "JourneyRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VoiceSession" ADD CONSTRAINT "VoiceSession_callAttemptId_fkey" FOREIGN KEY ("callAttemptId") REFERENCES "CallAttempt"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TranscriptSegment" ADD CONSTRAINT "TranscriptSegment_voiceSessionId_fkey" FOREIGN KEY ("voiceSessionId") REFERENCES "VoiceSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttempt" ADD CONSTRAINT "MessageAttempt_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "Brand"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageAttempt" ADD CONSTRAINT "MessageAttempt_journeyRunId_fkey" FOREIGN KEY ("journeyRunId") REFERENCES "JourneyRun"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AttributionMatch" ADD CONSTRAINT "AttributionMatch_journeyRunId_fkey" FOREIGN KEY ("journeyRunId") REFERENCES "JourneyRun"("id") ON DELETE CASCADE ON UPDATE CASCADE;
