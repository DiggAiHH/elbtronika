import { describe, it, expect } from "vitest";
import { MemoryManager } from "./memory";
import type { AgentTask } from "./types";

function mockTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: "task-1",
    type: "curate",
    status: "running",
    goal: "Curate artworks for Room 1",
    plan: ["Analyze set", "Query artworks", "Match"],
    currentStep: 0,
    assignedAgent: "hermes-curator",
    context: {},
    createdAt: new Date().toISOString(),
    ...overrides,
  };
}

describe("MemoryManager", () => {
  it("initializes working memory", () => {
    const mem = new MemoryManager();
    const task = mockTask();
    const working = mem.initWorkingMemory(task);
    expect(working.taskId).toBe(task.id);
    expect(working.goal).toBe(task.goal);
    expect(working.plan).toEqual(task.plan);
  });

  it("adds observations", () => {
    const mem = new MemoryManager();
    const task = mockTask();
    mem.initWorkingMemory(task);
    mem.addObservation(task.id, "Test observation");
    const working = mem.getWorkingMemory(task.id);
    expect(working?.observations.length).toBe(1);
    expect(working?.observations[0]).toContain("Test observation");
  });

  it("commits to episodic memory and clears working", () => {
    const mem = new MemoryManager();
    const task = mockTask({ status: "completed" });
    mem.initWorkingMemory(task);
    mem.addObservation(task.id, "Step 1 done");
    const episode = mem.commitToEpisodic(task);
    expect(episode.taskId).toBe(task.id);
    expect(episode.outcome).toBe("success");
    expect(mem.getWorkingMemory(task.id)).toBeUndefined();
  });

  it("searches episodic memory", () => {
    const mem = new MemoryManager();
    const task1 = mockTask({ id: "t1", goal: "Curate room A", status: "completed" });
    const task2 = mockTask({ id: "t2", goal: "Analyze sales", status: "completed" });
    mem.initWorkingMemory(task1);
    mem.commitToEpisodic(task1);
    mem.initWorkingMemory(task2);
    mem.commitToEpisodic(task2);

    const results = mem.searchEpisodic("curate", 5);
    expect(results.length).toBe(1);
    expect(results[0]!.goal).toBe("Curate room A");
  });

  it("registers and finds skills", () => {
    const mem = new MemoryManager();
    mem.registerSkill({
      id: "s1",
      name: "test_skill",
      description: "A test skill",
      triggerPatterns: ["test"],
      steps: ["Step 1"],
      toolsUsed: [],
      successRate: 1,
      usageCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    const skills = mem.findSkills("Run a test task");
    expect(skills.length).toBe(1);
    expect(skills[0]!.name).toBe("test_skill");
  });
});
