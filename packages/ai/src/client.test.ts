import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  generate,
  generateJson,
  stream,
  AIClientError,
  setLogHook,
  resetClient,
} from "./client";
import Anthropic from "@anthropic-ai/sdk";
import { z } from "zod";

// Mock Anthropic SDK with proper constructor and APIError class
vi.mock("@anthropic-ai/sdk", () => {
  class MockAPIError extends Error {
    status: number | undefined;
    headers: Record<string, string> | undefined;
    constructor(
      message: string,
      status?: number,
      headers?: Record<string, string>,
    ) {
      super(message);
      this.status = status;
      this.headers = headers;
    }
  }
  const MockAnthropic = vi.fn();
  (MockAnthropic as unknown as Record<string, unknown>).APIError = MockAPIError;
  return {
    default: MockAnthropic,
    APIError: MockAPIError,
  };
});

function createMockAnthropic(mockCreate: ReturnType<typeof vi.fn>) {
  return function MockAnthropic() {
    return { messages: { create: mockCreate } };
  };
}

describe("generate", () => {
  let mockCreate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    resetClient();
    process.env.ANTHROPIC_API_KEY = "test-key";
    mockCreate = vi.fn();
    (Anthropic as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      createMockAnthropic(mockCreate) as unknown as new (
        ...args: unknown[]
      ) => unknown,
    );
  });

  it("returns AIResponse on success", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "Hello world" }],
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    const response = await generate({
      system: "You are a test",
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(response.text).toBe("Hello world");
    expect(response.usage.inputTokens).toBe(10);
    expect(response.usage.outputTokens).toBe(5);
    expect(response.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it("throws AIClientError on timeout", async () => {
    const abortError = new Error("Request aborted");
    abortError.name = "AbortError";
    mockCreate.mockImplementation(
      () =>
        new Promise((_, reject) => {
          setTimeout(() => reject(abortError), 10);
        }),
    );

    await expect(
      generate(
        { system: "Test", messages: [{ role: "user", content: "Hi" }] },
        { timeoutMs: 5 },
      ),
    ).rejects.toThrow(AIClientError);
  });

  it("retries on 429 error", async () => {
    const APIError = (Anthropic as unknown as { APIError: typeof Error }).APIError;
    const apiError = Object.create(APIError.prototype);
    Object.assign(apiError, {
      status: 429,
      message: "Rate limited",
      headers: { "retry-after": "0" },
    });

    mockCreate
      .mockRejectedValueOnce(apiError)
      .mockResolvedValueOnce({
        content: [{ type: "text", text: "Success after retry" }],
        usage: { input_tokens: 10, output_tokens: 5 },
      });

    const response = await generate({
      system: "Test",
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(response.text).toBe("Success after retry");
    expect(mockCreate).toHaveBeenCalledTimes(2);
  });

  it("calls log hook on success", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: "Hello" }],
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    const logHook = vi.fn();
    setLogHook(logHook);

    await generate({
      system: "Test",
      messages: [{ role: "user", content: "Hi" }],
    });

    expect(logHook).toHaveBeenCalledTimes(1);
    expect(logHook).toHaveBeenCalledWith(
      expect.objectContaining({
        prompt: expect.any(Object),
        response: expect.any(Object),
        latencyMs: expect.any(Number),
      }),
    );
  });
});

describe("generateJson", () => {
  let mockCreate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    resetClient();
    process.env.ANTHROPIC_API_KEY = "test-key";
    mockCreate = vi.fn();
    (Anthropic as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      createMockAnthropic(mockCreate) as unknown as new (
        ...args: unknown[]
      ) => unknown,
    );
  });

  it("parses and validates JSON response", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: '{"name": "Test", "count": 42}' }],
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    const schema = z.object({ name: z.string(), count: z.number() });
    const { data } = await generateJson(
      { system: "Test", messages: [{ role: "user", content: "Hi" }] },
      schema,
    );

    expect(data).toEqual({ name: "Test", count: 42 });
  });

  it("extracts JSON from markdown code block", async () => {
    mockCreate.mockResolvedValue({
      content: [
        {
          type: "text",
          text: '```json\n{"value": 123}\n```',
        },
      ],
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    const schema = z.object({ value: z.number() });
    const { data } = await generateJson(
      { system: "Test", messages: [{ role: "user", content: "Hi" }] },
      schema,
    );

    expect(data).toEqual({ value: 123 });
  });

  it("throws on validation failure", async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: "text", text: '{"value": "not a number"}' }],
      usage: { input_tokens: 10, output_tokens: 5 },
    });

    const schema = z.object({ value: z.number() });

    await expect(
      generateJson(
        { system: "Test", messages: [{ role: "user", content: "Hi" }] },
        schema,
      ),
    ).rejects.toThrow(AIClientError);
  });
});

describe("stream", () => {
  let mockCreate: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.resetAllMocks();
    resetClient();
    process.env.ANTHROPIC_API_KEY = "test-key";
    mockCreate = vi.fn();
    (Anthropic as unknown as ReturnType<typeof vi.fn>).mockImplementation(
      createMockAnthropic(mockCreate) as unknown as new (
        ...args: unknown[]
      ) => unknown,
    );
  });

  it("yields text chunks", async () => {
    async function* mockStream() {
      yield {
        type: "content_block_delta",
        delta: { type: "text_delta", text: "Hello " },
      };
      yield {
        type: "content_block_delta",
        delta: { type: "text_delta", text: "world" },
      };
    }

    mockCreate.mockResolvedValue(mockStream());

    const chunks: string[] = [];
    for await (const chunk of stream({
      system: "Test",
      messages: [{ role: "user", content: "Hi" }],
    })) {
      chunks.push(chunk);
    }

    expect(chunks).toEqual(["Hello ", "world"]);
  });
});
