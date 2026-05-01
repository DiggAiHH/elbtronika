/**
 * Anthropic SDK client wrapper for ELBTRONIKA.
 * Server-side only. Never import this in client bundles.
 *
 * OPTIMIZATIONS (ADR 0019):
 * - Exponential backoff retry for 429/503 errors.
 * - Custom AIClientError with retryable flag and retryAfterMs.
 * - Streaming support via streamClaude().
 * - Zod schema validation in generateJson().
 * - Request/response logging hook for observability.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";
import type { AIModel, AIPrompt, AIResponse } from "./types";

const DEFAULT_MODEL: AIModel = "claude-sonnet-4-20250514";
const OPUS_MODEL: AIModel = "claude-opus-4-20250514";
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.7;
const REQUEST_TIMEOUT_MS = 25_000;
const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 1000;

/** Custom error class for AI client failures. */
export class AIClientError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly retryable: boolean,
    public readonly retryAfterMs?: number,
  ) {
    super(message);
    this.name = "AIClientError";
  }
}

/** Logging hook for observability (request/response metrics). */
export type LogHook = (entry: {
  prompt: AIPrompt;
  response?: AIResponse;
  error?: AIClientError;
  latencyMs: number;
}) => void;

let logHook: LogHook | null = null;

export function setLogHook(hook: LogHook | null): void {
  logHook = hook;
}

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new AIClientError(
      "ANTHROPIC_API_KEY is not set in environment",
      "missing_api_key",
      false,
    );
  }
  return key;
}

function mapModel(model: AIModel): string {
  switch (model) {
    case "claude-opus-4-20250514":
      return "claude-opus-4-20250514";
    default:
      return "claude-sonnet-4-20250514";
  }
}

let sharedClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (sharedClient === null) {
    sharedClient = new Anthropic({ apiKey: getApiKey() });
  }
  return sharedClient;
}

/** Reset shared client (e.g. after API key rotation). */
export function resetClient(): void {
  sharedClient = null;
}

function isRetryableError(err: unknown): { retryable: boolean; retryAfterMs?: number | undefined } {
  if (err instanceof Anthropic.APIError) {
    // 429 Too Many Requests — respect Retry-After header
    if (err.status === 429) {
      const retryAfter = err.headers?.["retry-after"];
      const retryAfterMs = retryAfter ? Number.parseInt(retryAfter, 10) * 1000 : undefined;
      return { retryable: true, retryAfterMs };
    }
    // 503 Service Unavailable — transient server error
    if (err.status === 503) {
      return { retryable: true };
    }
    // 500 Internal Server Error — sometimes transient
    if (err.status === 500) {
      return { retryable: true };
    }
  }
  // Network errors (fetch failures)
  if (err instanceof Error && err.name === "TypeError") {
    return { retryable: true };
  }
  return { retryable: false };
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export interface GenerateOptions {
  maxRetries?: number;
  retryDelayMs?: number;
  timeoutMs?: number;
}

export async function generate(prompt: AIPrompt, opts: GenerateOptions = {}): Promise<AIResponse> {
  const client = getClient();
  const model = mapModel(prompt.model ?? DEFAULT_MODEL);
  const maxTokens = prompt.maxTokens ?? DEFAULT_MAX_TOKENS;
  const temperature = prompt.temperature ?? DEFAULT_TEMPERATURE;
  const maxRetries = opts.maxRetries ?? MAX_RETRIES;
  const retryDelayMs = opts.retryDelayMs ?? BASE_RETRY_DELAY_MS;
  const timeoutMs = opts.timeoutMs ?? REQUEST_TIMEOUT_MS;

  const startedAt = Date.now();
  let lastError: AIClientError | undefined;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await client.messages.create(
        {
          model,
          max_tokens: maxTokens,
          temperature,
          system: prompt.system,
          messages: prompt.messages,
        },
        { signal: controller.signal },
      );

      clearTimeout(timeoutId);

      const content = response.content
        .filter((c): c is Anthropic.TextBlock => c.type === "text")
        .map((c) => c.text)
        .join("");

      const aiResponse: AIResponse = {
        text: content,
        model: prompt.model ?? DEFAULT_MODEL,
        usage: {
          inputTokens: response.usage.input_tokens,
          outputTokens: response.usage.output_tokens,
        },
        latencyMs: Date.now() - startedAt,
      };

      if (logHook) {
        logHook({ prompt, response: aiResponse, latencyMs: aiResponse.latencyMs });
      }

      return aiResponse;
    } catch (err) {
      clearTimeout(timeoutId);

      if (err instanceof Error && err.name === "AbortError") {
        lastError = new AIClientError(
          `AI request timed out after ${timeoutMs}ms`,
          "timeout",
          true,
          timeoutMs,
        );
      } else if (err instanceof Anthropic.APIError) {
        const { retryable, retryAfterMs: headerDelay } = isRetryableError(err);
        lastError = new AIClientError(
          err.message,
          `anthropic_${err.status}`,
          retryable,
          headerDelay,
        );
      } else if (err instanceof Error) {
        lastError = new AIClientError(err.message, "unknown", false);
      } else {
        lastError = new AIClientError("Unknown AI error", "unknown", false);
      }

      const { retryable, retryAfterMs: headerDelay } = isRetryableError(err);
      if (!retryable || attempt >= maxRetries) {
        break;
      }

      // Exponential backoff: 1s, 2s, 4s ... plus optional Retry-After header
      const delay = headerDelay ?? retryDelayMs * 2 ** attempt;
      await sleep(delay);
    }
  }

  if (logHook && lastError) {
    logHook({ prompt, error: lastError, latencyMs: Date.now() - startedAt });
  }

  throw lastError!;
}

/**
 * Stream an AI response for real-time UI updates.
 * Yields text chunks as they arrive from Anthropic.
 */
export async function* stream(
  prompt: AIPrompt,
  opts: GenerateOptions = {},
): AsyncGenerator<string, AIResponse, unknown> {
  const client = getClient();
  const model = mapModel(prompt.model ?? DEFAULT_MODEL);
  const maxTokens = prompt.maxTokens ?? DEFAULT_MAX_TOKENS;
  const temperature = prompt.temperature ?? DEFAULT_TEMPERATURE;
  const timeoutMs = opts.timeoutMs ?? REQUEST_TIMEOUT_MS;

  const startedAt = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const stream = await client.messages.create(
      {
        model,
        max_tokens: maxTokens,
        temperature,
        system: prompt.system,
        messages: prompt.messages,
        stream: true,
      },
      { signal: controller.signal },
    );

    let fullText = "";
    for await (const chunk of stream) {
      if (chunk.type === "content_block_delta" && chunk.delta.type === "text_delta") {
        const text = chunk.delta.text;
        fullText += text;
        yield text;
      }
    }

    clearTimeout(timeoutId);

    const response: AIResponse = {
      text: fullText,
      model: prompt.model ?? DEFAULT_MODEL,
      usage: { inputTokens: 0, outputTokens: 0 }, // Streaming doesn't provide usage
      latencyMs: Date.now() - startedAt,
    };

    if (logHook) {
      logHook({ prompt, response, latencyMs: response.latencyMs });
    }

    return response;
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new AIClientError(
        `AI stream timed out after ${timeoutMs}ms`,
        "timeout",
        true,
        timeoutMs,
      );
    }
    throw err;
  }
}

/**
 * Generate structured JSON output validated against a Zod schema.
 * Replaces the loose validator function with type-safe schema parsing.
 */
export async function generateJson<T>(
  prompt: AIPrompt,
  schema: z.ZodSchema<T>,
  opts: GenerateOptions = {},
): Promise<{ response: AIResponse; data: T }> {
  const response = await generate(prompt, opts);
  let parsed: unknown;
  try {
    parsed = JSON.parse(response.text);
  } catch {
    // Try extracting JSON from markdown code block
    const match = response.text.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (match) {
      try {
        parsed = JSON.parse(match[1]!);
      } catch {
        throw new AIClientError("AI response contained invalid JSON", "invalid_json", false);
      }
    } else {
      throw new AIClientError("AI response did not contain valid JSON", "invalid_json", false);
    }
  }

  const parseResult = schema.safeParse(parsed);
  if (!parseResult.success) {
    throw new AIClientError(
      `AI response JSON validation failed: ${parseResult.error.message}`,
      "validation_failed",
      false,
    );
  }

  return { response, data: parseResult.data };
}

export { DEFAULT_MAX_TOKENS, DEFAULT_MODEL, OPUS_MODEL };
