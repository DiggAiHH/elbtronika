/**
 * Browser Harness — Self-healing browser automation for AI agents.
 * Inspired by browser-use/browser-harness.
 */

import { CDPBridge, type CDPSessionOptions } from "./cdp";

export interface HarnessTask {
  id: string;
  url: string;
  instructions: string[];
  maxSteps: number;
}

export interface HarnessResult {
  taskId: string;
  success: boolean;
  steps: HarnessStep[];
  finalUrl: string;
  finalSnapshot: string;
  error?: string;
}

export interface HarnessStep {
  step: number;
  action: string;
  input?: string;
  output?: string;
  screenshot?: string;
  timestamp: string;
}

export class BrowserHarness {
  private cdp: CDPBridge;
  private sessionId: string;

  constructor(opts: CDPSessionOptions = {}) {
    this.cdp = new CDPBridge(opts);
    this.sessionId = `session-${Date.now()}`;
  }

  async start(): Promise<void> {
    await this.cdp.connect();
  }

  async stop(): Promise<void> {
    await this.cdp.disconnect();
  }

  /** Execute a task with the given instructions */
  async executeTask(task: HarnessTask): Promise<HarnessResult> {
    const steps: HarnessStep[] = [];

    try {
      await this.cdp.navigate(task.url);

      for (let i = 0; i < task.instructions.length && i < task.maxSteps; i++) {
        const instruction = task.instructions[i];
        if (!instruction) continue;
        const step: HarnessStep = {
          step: i + 1,
          action: instruction,
          timestamp: new Date().toISOString(),
        };

        // Parse simple natural language instructions
        const lower = instruction.toLowerCase();
        if (lower.startsWith("click ")) {
          const ref = instruction.slice(6).trim();
          await this.cdp.click(ref);
          step.output = `Clicked ${ref}`;
        } else if (lower.startsWith("type ")) {
          const match = instruction.match(/type\s+(@e\d+)\s+"(.+)"/i);
          if (match?.[1] && match[2]) {
            await this.cdp.type(match[1], match[2]);
            step.input = match[2];
            step.output = `Typed into ${match[1]}`;
          }
        } else if (lower.startsWith("navigate ")) {
          const url = instruction.slice(9).trim();
          const result = await this.cdp.navigate(url);
          step.output = `Navigated to ${result.title}`;
        } else if (lower.startsWith("snapshot")) {
          const snapshot = await this.cdp.snapshot();
          step.output = snapshot.slice(0, 500);
        } else if (lower.startsWith("screenshot")) {
          const parts = instruction.split(" ");
          const path = parts[1];
          const buffer = await this.cdp.screenshot(path);
          step.output = `Screenshot captured (${buffer.length} bytes)`;
        } else if (lower.startsWith("scroll")) {
          await this.cdp.scrollToBottom();
          step.output = "Scrolled to bottom";
        } else if (lower.startsWith("wait ")) {
          const ms = Number.parseInt(instruction.slice(5), 10) || 1000;
          await new Promise((r) => setTimeout(r, ms));
          step.output = `Waited ${ms}ms`;
        } else {
          step.output = `Unknown instruction: ${instruction}`;
        }

        steps.push(step);
      }

      const finalSnapshot = await this.cdp.snapshot();
      const finalUrl = this.cdp.getPage().url();

      return {
        taskId: task.id,
        success: true,
        steps,
        finalUrl,
        finalSnapshot: finalSnapshot.slice(0, 2000),
      };
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      return {
        taskId: task.id,
        success: false,
        steps,
        finalUrl: "",
        finalSnapshot: "",
        error,
      };
    }
  }

  getSessionId(): string {
    return this.sessionId;
  }

  /** Generate a Playwright test from a successful harness run */
  generatePlaywrightTest(result: HarnessResult): string {
    const testName = `test-${result.taskId}`;
    let code = `import { test, expect } from "@playwright/test";\n\n`;
    code += `test("${testName}", async ({ page }) => {\n`;

    for (const step of result.steps) {
      const lower = step.action.toLowerCase();
      if (lower.startsWith("navigate ")) {
        const url = step.action.slice(9).trim();
        code += `  await page.goto("${url}");\n`;
      } else if (lower.startsWith("click ")) {
        const ref = step.action.slice(6).trim();
        code += `  // TODO: replace ${ref} with proper selector\n`;
        code += `  await page.locator('[data-testid="${ref}"]').click();\n`;
      } else if (lower.startsWith("type ")) {
        const match = step.action.match(/type\s+(@e\d+)\s+"(.+)"/i);
        if (match?.[1] && match[2]) {
          code += `  // TODO: replace ${match[1]} with proper selector\n`;
          code += `  await page.locator('input').nth(${match[1].replace("@e", "")}).fill("${match[2]}");\n`;
        }
      } else if (lower.startsWith("snapshot")) {
        code += `  await expect(page).toHaveTitle(/./);\n`;
      }
    }

    code += `});\n`;
    return code;
  }
}
