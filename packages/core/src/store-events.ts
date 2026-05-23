import { z } from "zod";

export const moneySchema = z.object({
  amountMinor: z.number().int(),
  currency: z.string().min(3).max(3)
});

export const normalizedStoreEventSchema = z.object({
  eventId: z.string(),
  brandId: z.string(),
  connectorId: z.string(),
  source: z.enum(["shopify", "woocommerce", "custom_api", "script_pixel", "csv_import", "simulator"]),
  eventType: z.enum(["checkout_created", "checkout_updated", "order_created", "order_updated", "cart_abandoned"]),
  externalId: z.string(),
  idempotencyKey: z.string(),
  occurredAt: z.string(),
  customer: z.object({
    externalCustomerId: z.string().nullable(),
    email: z.string().email().nullable(),
    phoneE164: z.string().nullable(),
    firstName: z.string().nullable()
  }),
  cart: z.object({
    externalCheckoutId: z.string().nullable(),
    recoveryUrl: z.string().url().nullable(),
    total: moneySchema,
    items: z.array(
      z.object({
        externalProductId: z.string(),
        externalVariantId: z.string().nullable(),
        title: z.string(),
        quantity: z.number().int().positive(),
        unitPrice: moneySchema,
        productType: z.string().nullable(),
        tags: z.array(z.string())
      })
    )
  }),
  raw: z.record(z.string(), z.unknown()).default({})
});

export type NormalizedStoreEvent = z.infer<typeof normalizedStoreEventSchema>;

export function createSampleHighAovEvent(): NormalizedStoreEvent {
  return {
    eventId: "evt_sim_high_aov_001",
    brandId: "brand_demo",
    connectorId: "conn_simulator",
    source: "simulator",
    eventType: "checkout_updated",
    externalId: "sim_checkout_001",
    idempotencyKey: "simulator:checkout_updated:sim_checkout_001",
    occurredAt: new Date().toISOString(),
    customer: {
      externalCustomerId: null,
      email: "buyer@example.com",
      phoneE164: "+919999999999",
      firstName: "Aarav"
    },
    cart: {
      externalCheckoutId: "sim_checkout_001",
      recoveryUrl: "https://merchant.example/checkouts/sim_checkout_001",
      total: {
        amountMinor: 1800000,
        currency: "INR"
      },
      items: [
        {
          externalProductId: "prod_001",
          externalVariantId: "var_001",
          title: "Premium D2C Product Bundle",
          quantity: 1,
          unitPrice: {
            amountMinor: 1800000,
            currency: "INR"
          },
          productType: "High Consideration",
          tags: ["high-aov", "pilot"]
        }
      ]
    },
    raw: {}
  };
}
