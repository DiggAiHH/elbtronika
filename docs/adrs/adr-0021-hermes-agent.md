# ADR 0021: Hermes Agent Runtime

## Status
Accepted — 2026-04-29

## Context
ELBTRONIKA braucht einen AI-Agent für: Kuratierung, Künstler-Onboarding, QA-Testing, Analytics. Der Agent soll selbstverbessernd sein (Skills lernen), Memory haben, und alle Services via MCP nutzen.

## Decision
Wir bauen einen **Hermes-inspired Agent Runtime** in `packages/agent/`:

### 3-Schicht Memory
1. **Working Memory**: Aktueller Task-Kontext (ephemeral, max 4k tokens)
2. **Episodic Memory**: Vergangene Tasks in Supabase `agent_episodes`
3. **Skill Memory**: Wiederverwendbare Skills als Registry-Einträge

### Agent Loop
```
plan → execute → observe → reflect → learn
```

### Komponenten
- **Planner**: Rule-based (schnell) + LLM-based (flexibel)
- **MCPClient**: Verbindet Agent mit allen MCP-Servern
- **SkillRegistry**: Built-in Skills + Auto-learning aus erfolgreichen Tasks

## Consequences
- **Positive**: Agent kann komplexe Workflows autonom ausführen; Skills werden über Zeit besser; Transparent durch Memory
- **Negative**: Memory-Wachstum muss geprunt werden; LLM-Calls für Planning sind teuer

## Alternatives Considered
- Nous Research Hermes direkt nutzen (Python-basiert, schlecht in unserem TS-Monorepo integrierbar)
- AutoGPT (zu experimentell, keine Production-Qualität)
- LangChain Agent (zu schwer, schlechte Kontrolle über Memory)
