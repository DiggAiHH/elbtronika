export { createMemoryAuditStore, hashPrompt, logDecision } from "./audit";
export type { GenerateOptions } from "./client";
export {
  AIClientError,
  DEFAULT_MODEL,
  generate,
  generateJson,
  OPUS_MODEL,
  resetClient,
  setLogHook,
  stream,
} from "./client";
export {
  createCurationPrompt,
  createDescriptionPrompt,
  createExplainPrompt,
  createFlowMatchPrompt,
  createRecommendationPrompt,
  SYSTEM_IDENTITY,
  SYSTEM_JSON,
} from "./prompts";
export { checkRateLimit, createMemoryStore, ROLE_LIMITS } from "./rate-limit";
export type {
  AgentPrompt,
  AIDecisionLog,
  AIDescriptionRequest,
  AIDescriptionResult,
  AIModel,
  AIPrompt,
  AIRecommendRequest,
  AIRecommendResult,
  AIResponse,
  AITool,
  AIToolResult,
  AIToolUse,
  FlowMatchRequest,
  FlowMatchResult,
  RateLimitStatus,
  UserRole,
} from "./types";
