/**
 * Planner — decomposes goals into executable steps.
 * Uses the AI package for LLM-based planning with fallback to rule-based.
 */

import type { AgentTask, Skill } from "./types";

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
    // This would call @elbtronika/ai generate() with a planning prompt
    // For now, return a structured placeholder that the agent loop uses
    // Placeholder: in production this would call generateJson() with:
    // system: `You are a planning agent... Available tools: ${availableTools.join(", ")}`
    // prompt: `${memoryContext}\n\nGoal: ${task.goal}`
    const steps = [
      `Understand: ${task.goal}`,
      "Query relevant data sources",
      "Analyze and process information",
      "Execute decision or action",
      "Validate and confirm outcome",
    ];

    return {
      steps,
      estimatedDurationMs: steps.length * 10000,
      requiredTools: availableTools.slice(0, 3),
    };
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
