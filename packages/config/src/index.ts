import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  APP_URL: z.string().url().default("http://localhost:3000"),
  API_URL: z.string().url().default("http://localhost:4000"),
  DATABASE_URL: z.string().default("postgresql://truffl:truffl@localhost:5432/truffl"),
  REDIS_URL: z.string().default("redis://localhost:6379"),
  SESSION_SECRET: z.string().default("local-dev-session-secret"),
  SHOPIFY_WEBHOOK_SECRET: z.string().optional(),
  SHOPIFY_ADMIN_ACCESS_TOKEN: z.string().optional(),
  SHOPIFY_STORE_DOMAIN: z.string().optional(),
  PLIVO_AUTH_ID: z.string().optional(),
  PLIVO_AUTH_TOKEN: z.string().optional(),
  PLIVO_FROM_NUMBER: z.string().optional(),
  TWILIO_ACCOUNT_SID: z.string().optional(),
  TWILIO_AUTH_TOKEN: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  WHATSAPP_PROVIDER: z.string().optional(),
  WHATSAPP_API_KEY: z.string().optional(),
  GOOGLE_SHEETS_CREDENTIALS_JSON: z.string().optional(),
  GOOGLE_SHEETS_SPREADSHEET_ID: z.string().optional()
});

export type AppEnv = z.infer<typeof envSchema>;

export function loadEnv(input: NodeJS.ProcessEnv = process.env): AppEnv {
  return envSchema.parse(input);
}
