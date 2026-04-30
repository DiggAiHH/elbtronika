/**
 * Benchmark Runner — Executes tasks, collects metrics, generates reports.
 */

import {
  createAudioMCPServer,
  createSanityMCPServer,
  createStripeMCPServer,
  createSupabaseMCPServer,
} from "@elbtronika/mcp";
import { HermesAgent } from "./agent";
import { MCPClient } from "./mcp-client";
import type { BenchmarkTask } from "./tasks";
import { benchmarkTasks } from "./tasks";

export interface RunMetrics {
  taskId: string;
  taskType: string;
  goal: string;
  difficulty: string;
  runNumber: number;
  status: "completed" | "failed" | "partial";
  stepsExecuted: number;
  totalSteps: number;
  executionTimeMs: number;
  skillsUsed: string[];
  skillsLearned: string[];
  toolsCalled: string[];
  replanCount: number;
  errorMessage: string | undefined;
  successRate: number; // 0-1
}

export interface BenchmarkReport {
  runs: RunMetrics[];
  summary: {
    totalTasks: number;
    totalRuns: number;
    overallSuccessRate: number;
    averageExecutionTimeMs: number;
    skillsLearnedTotal: number;
    improvementByRun: Array<{ run: number; avgSuccessRate: number; avgTimeMs: number }>;
    improvementByTask: Array<{
      taskId: string;
      run1: number;
      run2: number;
      run3: number;
      trend: "improving" | "stable" | "degrading";
    }>;
  };
}

export class BenchmarkRunner {
  private agent: HermesAgent;
  private runs: RunMetrics[] = [];

  constructor(simulatedLatencyMs = 15) {
    const mcp = new MCPClient();
    mcp.registerServer("supabase", createSupabaseMCPServer());
    mcp.registerServer("sanity", createSanityMCPServer());
    mcp.registerServer("stripe", createStripeMCPServer());
    mcp.registerServer("audio", createAudioMCPServer());
    this.agent = new HermesAgent({
      mcpClient: mcp,
      config: { simulatedLatencyMs },
    });
  }

  async runBenchmark(iterations = 3): Promise<BenchmarkReport> {
    console.log(
      `🚀 Starting benchmark: ${benchmarkTasks.length} tasks × ${iterations} iterations = ${benchmarkTasks.length * iterations} total runs\n`,
    );

    for (let i = 1; i <= iterations; i++) {
      console.log(`\n📊 Iteration ${i}/${iterations}`);
      console.log("─".repeat(60));

      for (const task of benchmarkTasks) {
        const metrics = await this.executeTask(task, i);
        this.runs.push(metrics);
        this.printRunResult(metrics);
      }
    }

    return this.generateReport();
  }

  private async executeTask(task: BenchmarkTask, runNumber: number): Promise<RunMetrics> {
    const startTime = Date.now();
    const skillsBefore = new Set(this.agent.skills.list().map((s) => s.name));

    try {
      const agentTask = this.agent.createTask(task.type, task.goal, task.context);
      const result = await this.agent.executeTask(agentTask.id);

      const executionTime = Date.now() - startTime;
      const skillsAfter = new Set(this.agent.skills.list().map((s) => s.name));
      const skillsLearned = Array.from(skillsAfter).filter((s) => !skillsBefore.has(s));

      // Determine which skills were used
      const skillsUsed = this.agent.skills.findByTrigger(task.goal).map((s) => s.name);

      // Estimate tools called from working memory
      const workingMem = this.agent.memory.getWorkingMemory(agentTask.id);
      const toolsCalled = workingMem?.toolCalls.map((tc) => tc.tool) ?? [];

      // Calculate replan count (difference between initial plan and final plan)
      const replanCount = Math.max(0, result.plan.length - task.expectedTools.length);

      // Calculate success rate
      let successRate = 0;
      if (result.status === "completed") {
        successRate = 1;
      } else if (result.status === "running") {
        successRate = result.currentStep / Math.max(1, result.plan.length);
      }

      return {
        taskId: task.id,
        taskType: task.type,
        goal: task.goal,
        difficulty: task.difficulty,
        runNumber,
        status:
          result.status === "completed"
            ? "completed"
            : result.status === "failed"
              ? "failed"
              : "partial",
        stepsExecuted: result.currentStep,
        totalSteps: result.plan.length,
        executionTimeMs: executionTime,
        skillsUsed: [...new Set(skillsUsed)],
        skillsLearned,
        toolsCalled: [...new Set(toolsCalled)],
        replanCount,
        errorMessage: result.error,
        successRate,
      };
    } catch (err) {
      return {
        taskId: task.id,
        taskType: task.type,
        goal: task.goal,
        difficulty: task.difficulty,
        runNumber,
        status: "failed",
        stepsExecuted: 0,
        totalSteps: 0,
        executionTimeMs: Date.now() - startTime,
        skillsUsed: [],
        skillsLearned: [],
        toolsCalled: [],
        replanCount: 0,
        errorMessage: err instanceof Error ? err.message : String(err),
        successRate: 0,
      };
    }
  }

  private printRunResult(metrics: RunMetrics): void {
    const icon = metrics.status === "completed" ? "✅" : metrics.status === "partial" ? "⚠️" : "❌";
    const time = `${(metrics.executionTimeMs / 1000).toFixed(1)}s`;
    const skills =
      metrics.skillsLearned.length > 0 ? ` (+${metrics.skillsLearned.length} skills)` : "";
    console.log(
      `  ${icon} ${metrics.taskId} [Run ${metrics.runNumber}] — ${time} — ${Math.round(metrics.successRate * 100)}%${skills}`,
    );
    if (metrics.errorMessage) {
      console.log(`     ⚠️ ${metrics.errorMessage.slice(0, 80)}`);
    }
  }

  private generateReport(): BenchmarkReport {
    const totalRuns = this.runs.length;
    const completed = this.runs.filter((r) => r.status === "completed").length;
    const overallSuccessRate = completed / totalRuns;
    const avgTime = this.runs.reduce((sum, r) => sum + r.executionTimeMs, 0) / totalRuns;
    const skillsLearnedTotal = new Set(this.runs.flatMap((r) => r.skillsLearned)).size;

    // Improvement by run
    const maxRun = Math.max(...this.runs.map((r) => r.runNumber));
    const improvementByRun = [];
    for (let run = 1; run <= maxRun; run++) {
      const runMetrics = this.runs.filter((r) => r.runNumber === run);
      const avgSuccess = runMetrics.reduce((s, r) => s + r.successRate, 0) / runMetrics.length;
      const avgTimeMs = runMetrics.reduce((s, r) => s + r.executionTimeMs, 0) / runMetrics.length;
      improvementByRun.push({ run, avgSuccessRate: avgSuccess, avgTimeMs });
    }

    // Improvement by task (compare run 1, 2, 3)
    const improvementByTask = [];
    for (const task of benchmarkTasks) {
      const taskRuns = this.runs
        .filter((r) => r.taskId === task.id)
        .sort((a, b) => a.runNumber - b.runNumber);
      const run1 = taskRuns[0]?.successRate ?? 0;
      const run2 = taskRuns[1]?.successRate ?? 0;
      const run3 = taskRuns[2]?.successRate ?? 0;
      const trend: "improving" | "stable" | "degrading" =
        run3 > run1 ? "improving" : run3 < run1 ? "degrading" : "stable";
      improvementByTask.push({ taskId: task.id, run1, run2, run3, trend });
    }

    return {
      runs: this.runs,
      summary: {
        totalTasks: benchmarkTasks.length,
        totalRuns,
        overallSuccessRate,
        averageExecutionTimeMs: avgTime,
        skillsLearnedTotal,
        improvementByRun,
        improvementByTask,
      },
    };
  }
}
