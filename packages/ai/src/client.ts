/**
 * Anthropic SDK client wrapper for ELBTRONIKA.
 * Server-side only. Never import this in client bundles.
 */

import Anthropic from "@anthropic-ai/sdk";
import type { AIPrompt, AIResponse, AIModel } from "./types";

const DEFAULT_MODEL: AIModel = "claude-sonnet-4-6";
const OPUS_MODEL: AIModel = "claude-opus-4-6";
const DEFAULT_MAX_TOKENS = 4096;
const DEFAULT_TEMPERATURE = 0.7;
const REQUEST_TIMEOUT_MS = 25_000;

function getApiKey(): string {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    throw new Error("ANTHROPIC_API_KEY is not set in environment");
  }
  return key;
}

function mapModel(model: AIModel): string {
  // Map our abstract model names to Anthropic model IDs
  // Using stable aliases; adjust when Anthropic releases 4.6
  switch (model) {
    case "claude-opus-4-6":
      return "claude-3-7-sonnet-20250219"; // fallback to latest opus-class
    case "claude-sonnet-4-6":
    default:
      return "claude-3-7-sonnet-20250219";
  }
}

let sharedClient: Anthropic | null = null;

function getClient(): Anthropic {
  if (sharedClient === null) {
    sharedClient = new Anthropic({ apiKey: getApiKey() });
  }
  return sharedClient;
}

export async function generate(prompt: AIPrompt): Promise<AIResponse> {
  const client = getClient();
  const model = mapModel(prompt.model ?? DEFAULT_MODEL);
  const maxTokens = prompt.maxTokens ?? DEFAULT_MAX_TOKENS;
  const temperature = prompt.temperature ?? DEFAULT_TEMPERATURE;

  const startedAt = Date.now();

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

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

    return {
      text: content,
      model: prompt.model ?? DEFAULT_MODEL,
      usage: {
        inputTokens: response.usage.input_tokens,
        outputTokens: response.usage.output_tokens,
      },
      latencyMs: Date.now() - startedAt,
    };
  } catch (err) {
    clearTimeout(timeoutId);
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(`AI request timed out after ${REQUEST_TIMEOUT_MS}ms`);
    }
    throw err;
  }
}

export async function generateJson<T>(
  prompt: AIPrompt,
  validator: (value: unknown) => T,
): Promise<{ response: AIResponse; data: T }> {
  const response = await generate(prompt);
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
        throw new Error("AI response contained invalid JSON");
      }
    } else {
      throw new Error("AI response did not contain valid JSON");
    }
  }
  const data = validator(parsed);
  return { response, data };
}

export { DEFAULT_MODEL, OPUS_MODEL, DEFAULT_MAX_TOKENS };
