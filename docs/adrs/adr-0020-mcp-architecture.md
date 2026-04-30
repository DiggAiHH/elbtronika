# ADR 0020: MCP Architecture for AI Tool Access

## Status
Accepted — 2026-04-29

## Context
Kimi (und zukünftig weitere AI Agents) muss auf alle ELBTRONIKA-Services zugreifen können: Supabase (Datenbank), Sanity (CMS), Stripe (Payments), Audio-Analyse. Bisher gab es keine standardisierte Schnittstelle für AI-Tool-Access.

## Decision
Wir implementieren **Model Context Protocol (MCP)** Server für alle Services. MCP ist Anthropic's offener Standard (JSON-RPC 2.0) für AI-Tool-Integration — vergleichbar mit USB-C für AI.

### Architektur
```
Kimi / MCP Client
       │
       ▼
┌─────────────────┐
│  MCP Server Hub │
│  packages/mcp/  │
├─────────────────┤
│ supabase-server │
│ sanity-server   │
│ stripe-server   │
│ audio-server    │
└─────────────────┘
```

### Implementierung
- Eigenes JSON-RPC 2.0 Protokoll (kein SDK nötig, ~400 LOC)
- Jeder Server exponiert Tools mit Zod-Schemas
- Auth via Service-Role-Keys / API-Keys
- HTTP/SSE und stdio Transport

## Consequences
- **Positive**: Einheitliche Tool-Schnittstelle für alle Agents; N+M statt N×M Integrationen; Capability Discovery eingebaut
- **Negative**: Zusätzliche Abstraktionsschicht; JSON-RPC Overhead minimal

## Alternatives Considered
- OpenAI Function Calling (proprietär, vendor lock-in)
- LangChain Tools (zu schwer, zu viel Overhead)
- Eigenes REST API (kein Standard, schlechte Interoperabilität)
