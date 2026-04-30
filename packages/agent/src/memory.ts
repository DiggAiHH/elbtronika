/**
 * Memory Manager — 3-layer memory system
 * Working (ephemeral) → Episodic (Supabase) → Skills (filesystem/registry)
 */

import type { WorkingMemory, EpisodicMemory, Skill, AgentTask } from "./types";

export class MemoryManager {
  private working = new Map<string, WorkingMemory>();
  private episodic: EpisodicMemory[] = [];
  private skills = new Map<string, Skill>();
  private maxWorkingEntries = 10;
  private maxEpisodicEntries = 100;

  /** Initialize working memory for a task */
  initWorkingMemory(task: AgentTask): WorkingMemory {
    const mem: WorkingMemory = {
      taskId: task.id,
      goal: task.goal,
      plan: [...task.plan],
      currentStep: 0,
      observations: [],
      toolCalls: [],
      reflections: [],
    };
    this.working.set(task.id, mem);
    this.pruneWorkingMemory();
    return mem;
  }

  getWorkingMemory(taskId: string): WorkingMemory | undefined {
    return this.working.get(taskId);
  }

  updateWorkingMemory(taskId: string, updates: Partial<WorkingMemory>): void {
    const mem = this.working.get(taskId);
    if (!mem) return;
    Object.assign(mem, updates);
  }

  addObservation(taskId: string, observation: string): void {
    const mem = this.working.get(taskId);
    if (mem) {
      mem.observations.push(`[${new Date().toISOString()}] ${observation}`);
      if (mem.observations.length > 50) mem.observations.shift();
    }
  }

  addReflection(taskId: string, reflection: string): void {
    const mem = this.working.get(taskId);
    if (mem) {
      mem.reflections.push(reflection);
      if (mem.reflections.length > 20) mem.reflections.shift();
    }
  }

  /** Commit working memory to episodic memory after task completion */
  commitToEpisodic(task: AgentTask): EpisodicMemory {
    const working = this.working.get(task.id);
    const episode: EpisodicMemory = {
      id: `ep-${Date.now()}`,
      taskId: task.id,
      goal: task.goal,
      outcome: task.status === "completed" ? "success" : task.status === "failed" ? "failure" : "partial",
      keyObservations: working?.observations.slice(-10) ?? [],
      lessons: working?.reflections ?? [],
      createdAt: new Date().toISOString(),
    };
    this.episodic.unshift(episode);
    this.pruneEpisodic();
    this.working.delete(task.id);
    return episode;
  }

  /** Search episodic memory for similar goals */
  searchEpisodic(query: string, limit = 5): EpisodicMemory[] {
    const lowerQuery = query.toLowerCase();
    return this.episodic
      .filter((ep) => ep.goal.toLowerCase().includes(lowerQuery))
      .slice(0, limit);
  }

  /** Register or update a skill */
  registerSkill(skill: Skill): void {
    this.skills.set(skill.name, skill);
  }

  getSkill(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  /** Find skills matching a goal pattern */
  findSkills(goal: string): Skill[] {
    const lowerGoal = goal.toLowerCase();
    return Array.from(this.skills.values()).filter((s) =>
      s.triggerPatterns.some((p) => lowerGoal.includes(p.toLowerCase()))
    );
  }

  listSkills(): Skill[] {
    return Array.from(this.skills.values());
  }

  /** Serialize memory for LLM context injection */
  serializeForPrompt(taskId: string): string {
    const working = this.working.get(taskId);
    if (!working) return "";
    const relevantEpisodes = this.searchEpisodic(working.goal, 3);
    const relevantSkills = this.findSkills(working.goal);

    let prompt = `## Working Memory\nGoal: ${working.goal}\nPlan:\n`;
    for (let i = 0; i < working.plan.length; i++) {
      prompt += `${i + 1}. ${working.plan[i]}${i < working.currentStep ? " ✓" : ""}\n`;
    }
    if (working.observations.length > 0) {
      prompt += `\nObservations:\n${working.observations.slice(-5).join("\n")}\n`;
    }
    if (relevantEpisodes.length > 0) {
      prompt += `\n## Relevant Past Episodes\n`;
      for (const ep of relevantEpisodes) {
        prompt += `- ${ep.goal} (${ep.outcome}): ${ep.lessons.join("; ")}\n`;
      }
    }
    if (relevantSkills.length > 0) {
      prompt += `\n## Applicable Skills\n`;
      for (const skill of relevantSkills) {
        prompt += `- ${skill.name}: ${skill.description} (${skill.successRate * 100}% success, ${skill.usageCount} uses)\n`;
      }
    }
    return prompt;
  }

  private pruneWorkingMemory(): void {
    while (this.working.size > this.maxWorkingEntries) {
      const firstKey = this.working.keys().next().value;
      if (firstKey) this.working.delete(firstKey);
    }
  }

  private pruneEpisodic(): void {
    if (this.episodic.length > this.maxEpisodicEntries) {
      this.episodic = this.episodic.slice(0, this.maxEpisodicEntries);
    }
  }
}
