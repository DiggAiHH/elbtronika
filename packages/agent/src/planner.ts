/**
 * Planner — decomposes goals into executable steps.
 * Uses the AI package for LLM-based planning with fallback to rule-based.
 */

import type { AgentTask, Skill } from "./types";
import { generateJson } from "@elbtronika/ai";
import { z } from "zod";

const PlanSchema = z.object({
  steps: z.array(z.string().min(1)).min(2).max(10),
  requiredTools: z.array(z.string()),
  estimatedDurationMs: z.number().int().positive(),
});

export interface PlanResult {
  steps: string[];
  estimatedDurationMs: number;
  requiredTools: string[];
  fallbackPlan?: string[];
}

export class Planner {
  /** Plan a task using rule-based decomposition (fast, no LLM call) */
  planRuleBased(task: AgentTask, skills: Skill[]): PlanResult {
    // If a skill matches, use its steps
    for (const skill of skills) {
      if (skill.triggerPatterns.some((p) => task.goal.toLowerCase().includes(p.toLowerCase()))) {
        return {
          steps: [...skill.steps],
          estimatedDurationMs: skill.steps.length * 5000,
          requiredTools: [...skill.toolsUsed],
        };
      }
    }

    // Generic decomposition
    const steps = [
      `Analyze goal: ${task.goal}`,
      "Gather required context and data",
      "Execute primary action",
      "Validate results",
      "Report outcome",
    ];
    return {
      steps,
      estimatedDurationMs: steps.length * 8000,
      requiredTools: [],
    };
  }

  /** Plan a task using LLM (more flexible, slower) */
  async planWithLLM(
    task: AgentTask,
    availableTools: string[],
    _memoryContext: string,
  ): Promise<PlanResult> {
      const toolList =
        availableTools.length > 0 ? availableTools.slice(0, 20).join(", ") : "no tools registered";

      try {
        const { data } = await generateJson(
          {
            system: `You are HERMES — the planning agent for ELBTRONIKA, an art-tech platform.
  Decompose the user's goal into 3-7 concrete, sequential steps.
  Each step must be an actionable instruction (not a question).
  Only reference tools from the available list when needed.
  Respond ONLY with valid JSON — no markdown, no prose outside the JSON object.`,
            messages: [
              {
                role: "user",
                content: `Available tools: ${toolList}\n\nMemory context:\n${_memoryContext}\n\nGoal: ${task.goal}\n\nRespond with:\n{\n  "steps": ["step 1", "step 2", ...],\n  "requiredTools": ["tool_name"],\n  "estimatedDurationMs": 30000\n}`,
              },
            ],
            model: "claude-sonnet-4-20250514",
            maxTokens: 512,
            temperature: 0.3,
          },
          PlanSchema,
        );

        return {
          steps: data.steps,
          estimatedDurationMs: data.estimatedDurationMs,
          requiredTools: data.requiredTools,
        };
      } catch {
        // Gracefully fall back if LLM unavailable (no API key in test/CI environments)
        const fallbackSteps = [
          `Understand goal: ${task.goal}`,
          "Query relevant data sources",
          "Analyze and process information",
          "Execute primary action",
          "Validate and confirm outcome",
        ];
        return {
          steps: fallbackSteps,
          estimatedDurationMs: fallbackSteps.length * 10000,
          requiredTools: availableTools.slice(0, 3),
        };
      }
  }

  /** Replan when a step fails */
  replanAfterFailure(task: AgentTask, failedStep: number, error: string): PlanResult {
    const completed = task.plan.slice(0, failedStep);
    const alternative = [
      ...completed,
      `Retry step ${failedStep + 1} with modified approach (previous error: ${error})`,
      "If retry fails, escalate to human operator",
    ];
    return {
      steps: alternative,
      estimatedDurationMs: alternative.length * 10000,
      requiredTools: [],
      fallbackPlan: [...completed, "Escalate to human operator"],
    };
  }
}
