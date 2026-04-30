/**
 * Browser Tools — MCP-compatible tool definitions for browser automation.
 */

import type { ToolDefinition } from "@elbtronika/mcp";
import { BrowserHarness } from "./harness";

const activeHarnesses = new Map<string, BrowserHarness>();

export const browserTools: ToolDefinition[] = [
  {
    name: "browser_navigate",
    description: "Navigate to a URL in the browser.",
    schema: {
      type: "object",
      properties: {
        url: { type: "string", description: "URL to navigate to" },
        sessionId: { type: "string", description: "Browser session ID (optional)" },
      },
      required: ["url"],
    },
    handler: async (params: Record<string, unknown>) => {
      const url = String(params.url);
      const sessionId = String(params.sessionId ?? `session-${Date.now()}`);
      let harness = activeHarnesses.get(sessionId);
      if (!harness) {
        harness = new BrowserHarness();
        await harness.start();
        activeHarnesses.set(sessionId, harness);
      }
      const result = await harness.executeTask({
        id: `nav-${Date.now()}`,
        url,
        instructions: ["snapshot"],
        maxSteps: 1,
      });
      return { sessionId, title: result.finalUrl, snapshot: result.finalSnapshot };
    },
  },
  {
    name: "browser_click",
    description: "Click an element by its ref ID from a snapshot.",
    schema: {
      type: "object",
      properties: {
        ref: { type: "string", description: "Element ref ID (e.g. @e5)" },
        sessionId: { type: "string" },
      },
      required: ["ref"],
    },
    handler: async (params: Record<string, unknown>) => {
      const ref = String(params.ref);
      const sessionId = String(params.sessionId ?? "");
      const harness = activeHarnesses.get(sessionId);
      if (!harness) throw new Error("No active browser session. Call browser_navigate first.");
      const result = await harness.executeTask({
        id: `click-${Date.now()}`,
        url: "about:blank",
        instructions: [`click ${ref}`, "snapshot"],
        maxSteps: 2,
      });
      return { success: result.success, snapshot: result.finalSnapshot };
    },
  },
  {
    name: "browser_type",
    description: "Type text into an input element.",
    schema: {
      type: "object",
      properties: {
        ref: { type: "string" },
        text: { type: "string" },
        sessionId: { type: "string" },
      },
      required: ["ref", "text"],
    },
    handler: async (params: Record<string, unknown>) => {
      const ref = String(params.ref);
      const text = String(params.text);
      const sessionId = String(params.sessionId ?? "");
      const harness = activeHarnesses.get(sessionId);
      if (!harness) throw new Error("No active browser session.");
      const result = await harness.executeTask({
        id: `type-${Date.now()}`,
        url: "about:blank",
        instructions: [`type ${ref} "${text}"`, "snapshot"],
        maxSteps: 2,
      });
      return { success: result.success, snapshot: result.finalSnapshot };
    },
  },
  {
    name: "browser_snapshot",
    description: "Get a text snapshot of the current page.",
    schema: {
      type: "object",
      properties: {
        full: { type: "boolean", default: false },
        sessionId: { type: "string" },
      },
    },
    handler: async (params: Record<string, unknown>) => {
      const sessionId = String(params.sessionId ?? "");
      const harness = activeHarnesses.get(sessionId);
      if (!harness) throw new Error("No active browser session.");
      const result = await harness.executeTask({
        id: `snap-${Date.now()}`,
        url: "about:blank",
        instructions: [params.full ? "snapshot full" : "snapshot"],
        maxSteps: 1,
      });
      return { snapshot: result.finalSnapshot };
    },
  },
  {
    name: "browser_screenshot",
    description: "Take a screenshot of the current page.",
    schema: {
      type: "object",
      properties: {
        sessionId: { type: "string" },
        path: { type: "string" },
      },
    },
    handler: async (params: Record<string, unknown>) => {
      const sessionId = String(params.sessionId ?? "");
      const harness = activeHarnesses.get(sessionId);
      if (!harness) throw new Error("No active browser session.");
      const result = await harness.executeTask({
        id: `shot-${Date.now()}`,
        url: "about:blank",
        instructions: [params.path ? `screenshot ${String(params.path)}` : "screenshot"],
        maxSteps: 1,
      });
      return { success: result.success };
    },
  },
  {
    name: "browser_close",
    description: "Close a browser session.",
    schema: {
      type: "object",
      properties: {
        sessionId: { type: "string" },
      },
    },
    handler: async (params: Record<string, unknown>) => {
      const sessionId = String(params.sessionId ?? "");
      const harness = activeHarnesses.get(sessionId);
      if (harness) {
        await harness.stop();
        activeHarnesses.delete(sessionId);
      }
      return { closed: true };
    },
  },
];
