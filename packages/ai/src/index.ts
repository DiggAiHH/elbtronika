export {
  generate,
  generateJson,
  stream,
  AIClientError,
  setLogHook,
  resetClient,
  DEFAULT_MODEL,
  OPUS_MODEL,
} from "./client";
export type { GenerateOptions } from "./client";
export {
  createDescriptionPrompt,
  createRecommendationPrompt,
  createExplainPrompt,
  createFlowMatchPrompt,
  createCurationPrompt,
  SYSTEM_IDENTITY,
  SYSTEM_JSON,
} from "./prompts";
export { checkRateLimit, createMemoryStore, ROLE_LIMITS } from "./rate-limit";
export { logDecision, createMemoryAuditStore, hashPrompt } from "./audit";
export type {
  AIModel,
  AIPrompt,
  AIResponse,
  AIDescriptionRequest,
  AIDescriptionResult,
  AIRecommendRequest,
  AIRecommendResult,
  AIDecisionLog,
  RateLimitStatus,
  UserRole,
  AITool,
  AIToolUse,
  AIToolResult,
  AgentPrompt,
  FlowMatchRequest,
  FlowMatchResult,
} from "./types";
