import type { NormalizedStoreEvent } from "@truffl/core";

export type StoreConnectorCapability =
  | "checkout_events"
  | "order_events"
  | "recovery_url"
  | "product_catalog"
  | "customer_phone"
  | "customer_email"
  | "script_pixel"
  | "csv_import";

export type StoreConnectorKind = "shopify" | "woocommerce" | "custom_api" | "script_pixel" | "csv_import";

export type StoreConnectorHealth = {
  connected: boolean;
  capabilities: StoreConnectorCapability[];
  warnings: string[];
};

export interface StoreConnectorAdapter {
  kind: StoreConnectorKind;
  getHealth(brandId: string): Promise<StoreConnectorHealth>;
  normalizeWebhook(payload: unknown): Promise<NormalizedStoreEvent>;
}
