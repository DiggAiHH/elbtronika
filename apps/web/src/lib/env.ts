import { z } from "zod";

/**
 * Runtime environment validation.
 * Fails fast on startup if required variables are missing or invalid.
 *
 * Design principle: Core vars are required. Cloud-service vars are optional
 * so demo/staging can start without every integration configured.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),

  // Mode switch: demo | staging | live
  ELT_MODE: z.enum(["demo", "staging", "live"]).default("demo"),

  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(20),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(20).optional(),

  // Stripe
  STRIPE_SECRET_KEY: z.string().startsWith("sk_"),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith("whsec_"),
  STRIPE_PUBLISHABLE_KEY: z.string().startsWith("pk_").optional(),
  STRIPE_CONNECT_REDIRECT_URL: z.string().url().optional(),

  // Sanity
  NEXT_PUBLIC_SANITY_PROJECT_ID: z.string().min(1),
  NEXT_PUBLIC_SANITY_DATASET: z.string().default("production"),
  SANITY_API_READ_TOKEN: z.string().optional(),
  SANITY_API_TOKEN: z.string().optional(),
  SANITY_WEBHOOK_SECRET: z.string().optional(),

  // Cloudflare R2
  CLOUDFLARE_R2_ACCOUNT_ID: z.string().optional(),
  CLOUDFLARE_R2_ACCESS_KEY_ID: z.string().optional(),
  CLOUDFLARE_R2_SECRET_ACCESS_KEY: z.string().optional(),
  CLOUDFLARE_R2_BUCKET: z.string().optional(),
  CLOUDFLARE_R2_PUBLIC_URL: z.string().url().optional(),

  // AI & Messaging
  ANTHROPIC_API_KEY: z.string().startsWith("sk-ant-").optional(),
  RESEND_API_KEY: z.string().startsWith("re_").optional(),

  // App URL — supports both NEXT_PUBLIC_SITE_URL (Doppler standard) and
  // NEXT_PUBLIC_APP_URL (legacy) for backwards compatibility.
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  NEXT_PUBLIC_APP_URL: z.string().url().optional(),

  // Monitoring & Trust
  SENTRY_DSN: z.string().url().optional(),
  MCP_AUDIT_DB: z.enum(["true", "false"]).default("false"),
});

export type Env = z.infer<typeof envSchema>;

let _env: Env | null = null;

/** Clear cached env — useful for tests that mutate process.env. */
export function resetEnv(): void {
  _env = null;
}

export function getEnv(): Env {
  if (_env) return _env;

  const parsed = envSchema.safeParse({
    NODE_ENV: process.env.NODE_ENV,
    ELT_MODE: process.env.ELT_MODE,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
    STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    STRIPE_PUBLISHABLE_KEY: process.env.STRIPE_PUBLISHABLE_KEY,
    STRIPE_CONNECT_REDIRECT_URL: process.env.STRIPE_CONNECT_REDIRECT_URL,
    NEXT_PUBLIC_SANITY_PROJECT_ID: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: process.env.NEXT_PUBLIC_SANITY_DATASET,
    SANITY_API_READ_TOKEN: process.env.SANITY_API_READ_TOKEN,
    SANITY_API_TOKEN: process.env.SANITY_API_TOKEN,
    SANITY_WEBHOOK_SECRET: process.env.SANITY_WEBHOOK_SECRET,
    CLOUDFLARE_R2_ACCOUNT_ID: process.env.CLOUDFLARE_R2_ACCOUNT_ID,
    CLOUDFLARE_R2_ACCESS_KEY_ID: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    CLOUDFLARE_R2_SECRET_ACCESS_KEY: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
    CLOUDFLARE_R2_BUCKET: process.env.CLOUDFLARE_R2_BUCKET,
    CLOUDFLARE_R2_PUBLIC_URL: process.env.CLOUDFLARE_R2_PUBLIC_URL,
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    SENTRY_DSN: process.env.SENTRY_DSN,
    MCP_AUDIT_DB: process.env.MCP_AUDIT_DB,
  });

  if (!parsed.success) {
    const missing = parsed.error.errors.map((e) => e.path.join(".")).join(", ");
    throw new Error(`Invalid environment variables: ${missing}`);
  }

  _env = parsed.data;
  return _env;
}

/**
 * Client-safe subset of env vars.
 * Next.js only forwards NEXT_PUBLIC_* vars to the browser automatically.
 */
export function getPublicEnv() {
  const env = getEnv();
  return {
    ELT_MODE: env.ELT_MODE,
    NEXT_PUBLIC_SUPABASE_URL: env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    NEXT_PUBLIC_SANITY_PROJECT_ID: env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    NEXT_PUBLIC_SANITY_DATASET: env.NEXT_PUBLIC_SANITY_DATASET,
    NEXT_PUBLIC_SITE_URL: env.NEXT_PUBLIC_SITE_URL,
    NEXT_PUBLIC_APP_URL: env.NEXT_PUBLIC_APP_URL,
  };
}
