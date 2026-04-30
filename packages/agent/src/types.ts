/**
 * Hermes Agent Runtime Types
 * 3-layer memory: Working → Episodic → Skills
 */

export type AgentTaskType = "curate" | "onboard" | "test" | "analyze" | "research" | "custom";
export type AgentTaskStatus = "pending" | "running" | "completed" | "failed" | "cancelled";

export interface AgentTask {
  id: string;
  type: AgentTaskType;
  status: AgentTaskStatus;
  goal: string;
  plan: string[];
  currentStep: number;
  result?: unknown;
  error?: string;
  assignedAgent: string;
  context: Record<string, unknown>;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
}

export interface WorkingMemory {
  taskId: string;
  goal: string;
  plan: string[];
  currentStep: number;
  observations: string[];
  toolCalls: ToolCallRecord[];
  reflections: string[];
}

export interface ToolCallRecord {
  tool: string;
  input: Record<string, unknown>;
  output: unknown;
  latencyMs: number;
  timestamp: string;
}

export interface EpisodicMemory {
  id: string;
  taskId: string;
  goal: string;
  outcome: "success" | "failure" | "partial";
  keyObservations: string[];
  lessons: string[];
  createdAt: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  triggerPatterns: string[];
  steps: string[];
  toolsUsed: string[];
  successRate: number;
  usageCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AgentConfig {
  name: string;
  model: string;
  maxTokens: number;
  temperature: number;
  maxRetries: number;
  mcpServers: string[];
  memoryEnabled: boolean;
  skillAutoSave: boolean;
  simulatedLatencyMs?: number;
}

export const DEFAULT_AGENT_CONFIG: AgentConfig = {
  name: "hermes-curator",
  model: "claude-sonnet-4-20250514",
  maxTokens: 4096,
  temperature: 0.7,
  maxRetries: 3,
  mcpServers: ["supabase", "sanity", "stripe", "audio"],
  memoryEnabled: true,
  skillAutoSave: true,
  simulatedLatencyMs: 0,
};
