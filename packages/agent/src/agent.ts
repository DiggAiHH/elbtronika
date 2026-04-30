/**
 * Hermes Agent Runtime
 * Core loop: plan → execute → observe → reflect → learn
 */

import { v4 as uuidv4 } from "uuid";
import type { AgentTask, AgentConfig, AgentTaskType } from "./types";
import { DEFAULT_AGENT_CONFIG } from "./types";
import { MemoryManager } from "./memory";
import { SkillRegistry } from "./skills";
import { Planner } from "./planner";
import { MCPClient } from "./mcp-client";

export interface AgentOptions {
  config?: Partial<AgentConfig>;
  mcpClient?: MCPClient;
}

export class HermesAgent {
  config: AgentConfig;
  memory: MemoryManager;
  skills: SkillRegistry;
  planner: Planner;
  mcp: MCPClient;
  private tasks = new Map<string, AgentTask>();
  private running = false;

  constructor(opts: AgentOptions = {}) {
    this.config = { ...DEFAULT_AGENT_CONFIG, ...opts.config };
    this.memory = new MemoryManager();
    this.skills = new SkillRegistry();
    this.planner = new Planner();
    this.mcp = opts.mcpClient ?? new MCPClient();
    this.skills.loadBuiltInSkills();
  }

  /** Create a new task and optionally start it */
  createTask(
    type: AgentTaskType,
    goal: string,
    context: Record<string, unknown> = {}
  ): AgentTask {
    const id = uuidv4();
    const task: AgentTask = {
      id,
      type,
      status: "pending",
      goal,
      plan: [],
      currentStep: 0,
      assignedAgent: this.config.name,
      context,
      createdAt: new Date().toISOString(),
    };
    this.tasks.set(id, task);
    return task;
  }

  getTask(id: string): AgentTask | undefined {
    return this.tasks.get(id);
  }

  listTasks(): AgentTask[] {
    return Array.from(this.tasks.values());
  }

  /** Execute a task through the agent loop */
  async executeTask(taskId: string): Promise<AgentTask> {
    const task = this.tasks.get(taskId);
    if (!task) throw new Error(`Task not found: ${taskId}`);
    if (task.status === "running") throw new Error(`Task already running: ${taskId}`);

    task.status = "running";
    task.startedAt = new Date().toISOString();

    try {
      // Initialize working memory
      this.memory.initWorkingMemory(task);

      // Plan
      const relevantSkills = this.skills.findByTrigger(task.goal);
      const plan = this.planner.planRuleBased(task, relevantSkills);
      task.plan = plan.steps;
      this.memory.updateWorkingMemory(taskId, { plan: plan.steps });

      // Execute each step
      for (let i = 0; i < task.plan.length; i++) {
        task.currentStep = i;
        this.memory.updateWorkingMemory(taskId, { currentStep: i });

        const step = task.plan[i]!;
        this.memory.addObservation(taskId, `Starting step ${i + 1}: ${step}`);

        try {
          const result = await this.executeStep(task, step, plan.requiredTools);
          this.memory.addObservation(taskId, `Step ${i + 1} completed: ${JSON.stringify(result).slice(0, 200)}`);
        } catch (stepErr) {
          const error = stepErr instanceof Error ? stepErr.message : String(stepErr);
          this.memory.addObservation(taskId, `Step ${i + 1} failed: ${error}`);

          // Attempt replan
          const replan = this.planner.replanAfterFailure(task, i, error);
          task.plan = [...task.plan.slice(0, i), ...replan.steps];
          this.memory.updateWorkingMemory(taskId, { plan: task.plan });

          // If replan also fails, mark task failed
          if (i >= task.plan.length - 1) {
            throw stepErr;
          }
        }
      }

      // Reflect and learn
      this.memory.addReflection(taskId, `Task completed successfully. Plan: ${task.plan.join(" → ")}`);
      if (this.config.skillAutoSave && relevantSkills.length === 0) {
        // Auto-generate skill from successful novel task
        const mem = this.memory.getWorkingMemory(taskId);
        if (mem) {
          this.skills.learnFromTask(
            `auto_${task.type}_${Date.now()}`,
            `Auto-learned skill for ${task.type}`,
            task.goal,
            task.plan,
            plan.requiredTools
          );
        }
      }

      task.status = "completed";
      task.result = { success: true, stepsExecuted: task.currentStep + 1 };
      task.completedAt = new Date().toISOString();

      // Commit to episodic memory
      this.memory.commitToEpisodic(task);

      return task;
    } catch (err) {
      const error = err instanceof Error ? err.message : String(err);
      task.status = "failed";
      task.error = error;
      task.completedAt = new Date().toISOString();
      this.memory.commitToEpisodic(task);
      return task;
    }
  }

  private async executeStep(
    task: AgentTask,
    step: string,
    requiredTools: string[]
  ): Promise<unknown> {
    // Simulate execution latency for realistic benchmarking
    const baseDelay = this.config.simulatedLatencyMs ?? 0;
    if (baseDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, baseDelay));
    }

    // Simple heuristic: if step mentions a tool, try to invoke it
    for (const toolName of requiredTools) {
      if (step.toLowerCase().includes(toolName.toLowerCase().replace("_", " "))) {
        return this.mcp.invoke(toolName, task.context);
      }
    }

    // Default: treat as observation step (no tool call)
    return { observed: step, timestamp: new Date().toISOString() };
  }

  /** Start the agent's background loop (for autonomous operation) */
  async start(): Promise<void> {
    this.running = true;
    while (this.running) {
      // Process pending tasks
      for (const task of this.tasks.values()) {
        if (task.status === "pending") {
          await this.executeTask(task.id);
        }
      }
      // Sleep between cycles
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
  }

  stop(): void {
    this.running = false;
  }

  /** Get agent status and diagnostics */
  getStatus(): {
    name: string;
    running: boolean;
    tasksTotal: number;
    tasksPending: number;
    tasksRunning: number;
    tasksCompleted: number;
    tasksFailed: number;
    skillsLoaded: number;
    memoryEntries: number;
    mcpServers: string[];
  } {
    const all = this.listTasks();
    return {
      name: this.config.name,
      running: this.running,
      tasksTotal: all.length,
      tasksPending: all.filter((t) => t.status === "pending").length,
      tasksRunning: all.filter((t) => t.status === "running").length,
      tasksCompleted: all.filter((t) => t.status === "completed").length,
      tasksFailed: all.filter((t) => t.status === "failed").length,
      skillsLoaded: this.skills.list().length,
      memoryEntries: 0, // Would count from Supabase in production
      mcpServers: this.mcp.listServers(),
    };
  }
}
