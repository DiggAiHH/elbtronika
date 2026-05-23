# Phase 7 Deep Research — 3D + Voice + Avatars + Metaverse for ELBTRONIKA

**Context:** ELBTRONIKA is an immersive 3D online gallery merging electronic music (DJs) with visual art. Core feature: seamless transition between **Immersive Mode** (3D + Spatial Audio, WebGPU) and **Classic Mode** (Shop-Grid). Revenue split 60/20/20 (Artist / DJ / Platform). Stack: Next.js 15, React 19, Three.js r184, R3F v9, WebGPURenderer (WebGL2 fallback), Web Audio API + PannerNode, Supabase, Sanity, R2, Stripe Connect.

**Goal:** Inform Phase 7 ADR — Single Canvas architecture + voice/avatar integration + metaverse interop.

---

## Prompt 1 — Gemini 3 Pro Deep Research (Synthesis + Multimodal Landscape)

> **Role:** You are a senior research analyst for an immersive web platform combining electronic music, visual art and 3D galleries. I need a comprehensive, source-backed landscape analysis of the state of 3D + AI + voice + avatars + metaverse as of Q2 2026 — with emphasis on what is shippable on the open web (no walled gardens) using WebGPU, Three.js, React Three Fiber, Web Audio API.
>
> **Deliverables (structured):**
>
> 1. **State of the art — 3D on the Web 2026.** Cover WebGPU adoption, Three.js r184+ vs Babylon.js 7, R3F v9 ecosystem, performance benchmarks (draw calls, instancing, BVH, Nanite-style virtual geometry on web), and notable production deployments (e.g. Apple Vision Pro Safari, Chrome 138+ WebGPU, Meta Horizon Web). Include browser support matrix.
>
> 2. **AI-generated 3D — production-ready pipelines.** Compare in detail: Luma AI Genie, Meshy, CSM.ai, Tripo3D, NVIDIA Edify 3D, Adobe Substance 3D Sampler, Stability AI Stable Fast 3D, Microsoft Trellis, OpenAI Shap-E successors. For each: input modality, output format (GLB/USDZ/Gaussian Splats), polycount, retopology quality, licensing, API pricing, latency. Which are realistic for a music+art platform that needs ~50–500 generated assets/month?
>
> 3. **Gaussian Splatting + NeRF for galleries.** State of WebGL/WebGPU splat renderers (antimatter15, gsplat.js, Spark.art, Polycam viewer, SuperSplat). Performance on mid-range GPUs, file sizes, integration with R3F, suitability for displaying real-world captured art exhibitions.
>
> 4. **Voice + Avatars 2026.** Compare avatar systems shippable on web: Ready Player Me (RPM), Meta Avatars Web, Apple Persona-style, Inworld AI characters, Convai, NVIDIA Audio2Face-3D + Riva, ElevenLabs Conversational AI + 3D, HeyGen Interactive Avatars, Synthesia. Cover lip-sync quality (viseme accuracy), real-time latency (<300ms target), language coverage (DE/EN priority), licensing for commercial use, GDPR-compliance for EU users.
>
> 5. **Spatial Audio + WebGPU integration.** State of Web Audio API PannerNode in 2026, HRTF quality, Apple Spatial Audio web compat, Dolby Atmos for Web, IAMF (Immersive Audio Model and Formats) browser support. Best practices for syncing audio sources to 3D scene graph in R3F, hls.js workers, and avoiding audio drift during scene transitions (Single Canvas pattern).
>
> 6. **Metaverse interop standards 2026.** Status of OpenXR for web, Open Metaverse Interoperability Group (OMI3), Khronos glTF extensions (KHR_audio, KHR_node_visibility), VRM 1.0 adoption, USD on the Web (USDZ via WebKit, Hydra), W3C Immersive Web (WebXR Device API, WebXR Layers). Which standards are actually adopted by 2+ major platforms?
>
> 7. **Competitive landscape — music + art galleries.** Deep-dive case studies of: Sansar, VRChat (music events), Roblox concerts, Fortnite Soundwave/concerts, Decentraland Music Festival, Spatial.io, Mozilla Hubs successor (Hubs Cloud / Hubs Foundation), Frame.io, Museum of Other Realities. What works, what fails, business models, retention metrics where public.
>
> 8. **Recommendations.** Top-3 stacks I should evaluate for ELBTRONIKA's Single Canvas architecture (WebGPU + Three.js + R3F + Web Audio + voice avatar layer). For each: pros, cons, integration cost (engineer-weeks), licensing/runtime cost at 10k MAU.
>
> **Constraints:**
> - Cite primary sources (papers, GitHub repos, vendor docs, conference talks SIGGRAPH 2025 / Web3D / I/O 2025 / WWDC 2025). Avoid blog spam.
> - Prefer open-source / open-standard solutions where parity exists.
> - GDPR + EU AI Act compliance is non-negotiable (data hosted in EU-Frankfurt).
> - Include a "what's hype vs what's production" calibration column for every tech.
> - Output as Markdown with H2/H3 headings, comparison tables, and a final TL;DR scorecard.

---

## Prompt 2 — Moonshot Kimi K2.6 Deep Research (Asia + Implementation Depth)

> **Role:** You are a technical researcher with deep access to both Western and Asian (CN/JP/KR) sources on real-time 3D graphics, AI 3D generation, and avatar tech. I'm building ELBTRONIKA — a WebGPU-based immersive gallery for electronic music + visual art on the open web. I need you to surface tech I would otherwise miss because most Western research ignores Chinese / Asian ecosystems.
>
> **Specific questions:**
>
> 1. **Chinese AI 3D generation stack 2026.** Detailed comparison of: Tencent Hunyuan3D-2.0, Alibaba Tongyi 3D, ByteDance EnvyEditor / Volcano Engine 3D, Rhino3D (Yuanshi), Tripo3D (formerly DeepSeek 3D), Vast.ai Tripo. For each: open-weights availability (HuggingFace mirror), VRAM requirements, output quality vs Luma/Meshy, REST API endpoints reachable from EU, terms of service for commercial use outside CN.
>
> 2. **Tencent / NetEase metaverse infra.** What's the actual state of Tencent Cloud Metaverse Engine, NetEase Yaotai, ByteDance PICO Worlds web SDK? What can a non-Chinese developer realistically integrate via API?
>
> 3. **Asian avatar + voice stack.** SenseTime Avatar, Tencent Cloud Virtual Avatar, MiniMax Conversational AI, Moonshot Kimi voice, Alibaba Qwen-Audio for real-time lip-sync. Comparison vs RPM + ElevenLabs on latency, naturalness in Mandarin/Japanese/Korean and crucially also German/English. Pricing in USD/EUR.
>
> 4. **WebGPU production deployments in Asia.** Are there shipping web apps using WebGPU at scale in CN/JP? Specifically: Tencent QQ Web 3D, Baidu Apollo Web, NetEase ePic, BiliBili 3D Viewer. Performance reports.
>
> 5. **Spatial audio + immersive music — non-Western patents and engines.** Sony 360 Reality Audio web playback status. Huawei AudioVivid. Tencent Audio Lab spatial. IAMF (which originated partly from Samsung/Google) latest profile support.
>
> 6. **Reusable code patterns.** Concrete TypeScript/React Three Fiber v9 + Three.js r184 code snippets demonstrating: (a) WebGPURenderer with WebGL2 fallback, (b) Single Canvas pattern where camera + shaders transition between "shop grid" and "immersive 3D" without canvas remount, (c) PannerNode bound to R3F mesh position with proper distance model, (d) Ready Player Me avatar loaded into R3F with morph-target driven viseme lip-sync from incoming audio stream. Cite GitHub repos.
>
> 7. **Engineering-harness automation.** What MCPs, CLIs and AI tools (from anywhere globally) exist in 2026 for: auto-generating 3D scenes from Sanity CMS schemas, scaffolding R3F components from Figma, generating Three.js shader code (TSL) from natural language, automated Lighthouse-equivalent for WebGPU pages.
>
> **Output format:**
> - One section per question.
> - For each tech: table with columns `Name | Origin | Open? | API EU-reachable | EUR/1k calls | Quality 1-5 | Best for ELBTRONIKA y/n + reason`.
> - End with: "Top 5 things ELBTRONIKA should adopt that Western-only research would have missed" + a 100-line code skeleton for the Single Canvas WebGPU transition.

---

## Prompt 3 — Moonshot Kimi K2 Coding Agent (Produce, Don't Just Research)

> **Role:** You are Kimi K2 in coding-agent mode. Goal: produce a working spike repo for ELBTRONIKA Phase 7. Don't write essays. Write code.
>
> **Stack constraints (hard):**
> - Next.js 15 App Router + React 19 + TypeScript strict
> - Three.js r184 + @react-three/fiber v9 + @react-three/drei v10
> - WebGPURenderer primary, WebGL2 fallback via Three's `WebGPURenderer.isAvailable()`
> - Zustand v5 global state, no Redux
> - Web Audio API native + hls.js v1.6 in a Web Worker
> - Biome v2 lint, Vitest unit tests, Playwright e2e
> - Doppler for env, Cloudflare Pages deploy target
>
> **Deliverables — generate the actual files:**
>
> 1. `apps/web/src/three/canvas/SingleCanvas.tsx` — single `<Canvas>` that mounts once. Two scenes: `ImmersiveScene` (3D room) and `ClassicScene` (orthographic camera over grid of artwork billboards). Transition via animated camera + post-processing crossfade (TSL shader) — never remount. Use Zustand store `useModeStore` with `mode: 'immersive' | 'classic'`.
>
> 2. `apps/web/src/three/audio/SpatialAudioBridge.tsx` — hook that takes a `MeshRef` and an HLS URL, creates a `PannerNode` bound to mesh world position each frame, distance model `inverse`, refDistance 1, rolloffFactor 1. Handles audio context resume on first user gesture. Tested with Vitest using a `mock-audio-context`.
>
> 3. `apps/web/src/three/avatar/RPMAvatar.tsx` — loads a Ready Player Me `.glb`, exposes morph-target lip-sync driven by an input `MediaStream`. Use AudioWorklet with a simple RMS-to-viseme mapping (mouthOpen, mouthSmile, jawOpen). Type-safe.
>
> 4. `apps/web/src/three/effects/ModeTransition.tsx` — TSL post-process node that crossfades render of both scenes over 800ms with an easing curve. Falls back to a CSS-based crossfade in WebGL2 mode.
>
> 5. `apps/web/src/lib/r2.ts` — already exists, but extend with `getPresignedGLBUrl(artworkId)` returning a signed URL with `Cache-Control: public, max-age=31536000, immutable`.
>
> 6. `apps/web/__tests__/three/single-canvas.test.tsx` — Vitest + @testing-library/react that mounts `SingleCanvas`, toggles store mode, asserts canvas DOM node count stays at 1.
>
> 7. `apps/web/e2e/immersive-mode.spec.ts` — Playwright spec: visit `/`, click "Enter Immersive", wait for `data-state="immersive"`, assert WebGPU adapter detected (or graceful fallback message in WebGL2).
>
> 8. `docs/adr/0006-phase7-single-canvas.md` — short ADR (max 200 lines) summarising the architectural decision: why single canvas, why TSL crossfade, why PannerNode (not Resonance Audio), trade-offs, rollback path.
>
> **Rules of engagement:**
> - Output as a single response with each file in a `## File: <path>` H2 block + fenced ```ts code block.
> - No prose between files except a one-line rationale per file.
> - Include all imports. Code must compile under `tsc --strict`.
> - Total response budget: ~2500 lines max. Skip anything that isn't on the deliverable list.
> - End with a "## Open Questions for Lou" bullet list of design decisions you couldn't resolve.

---

## Prompt 4 (Bonus) — Microsoft 365 Copilot Deep Research (MS Stack Lens)

> **Role:** Senior solutions architect on the Microsoft platform. Evaluate ELBTRONIKA — an immersive 3D web gallery for electronic music + art (Next.js + Three.js + WebGPU + Supabase) — through the lens of the Microsoft ecosystem. I am NOT switching off Supabase/Cloudflare/Netlify, but I want to know which Microsoft pieces are worth bolting on selectively.
>
> **Cover:**
>
> 1. **Microsoft Mesh 2026** — current SDK status for web (not just Teams). Avatar interop with VRM / Ready Player Me. Can Mesh avatars be embedded in a non-Teams web app? Licensing.
>
> 2. **Azure AI Speech & Avatar (Text-to-Speech Avatar, Custom Neural Voice).** Real-time interactive avatar latency, EU data residency (Germany West Central, Sweden Central), pricing per stream-minute, support for German neural voices, GDPR + EU AI Act risk class.
>
> 3. **Azure OpenAI vs Anthropic Claude (already in stack via Doppler).** Should ELBTRONIKA add Azure OpenAI as a backup provider for AI-driven art descriptions / DJ-set tagging? Cost comparison at 10M tokens/month, latency from EU, content-filter friction for music/art content.
>
> 4. **Microsoft Fabric / Power BI for the 60/20/20 revenue dashboard.** Worth it vs building in-house Recharts dashboard? GDPR considerations for connecting Power BI to Supabase Postgres in EU-Frankfurt.
>
> 5. **GitHub Copilot Workspace + Copilot Agents** — current state of multi-file agent workflows on a pnpm monorepo with Turborepo. Comparison vs Claude Code (already used) and Cursor.
>
> 6. **Microsoft Entra ID External Identities** — alternative to Supabase Auth for artist/DJ accounts? Realistic for a solo-builder side platform or overkill?
>
> 7. **Realistic recommendation:** one bullet list of "adopt now", "evaluate in 6 months", "ignore" — explicitly for a solo-builder shipping a music+art platform out of Hamburg/Germany.
>
> **Format:** Markdown, max 1500 words, tables where useful, every claim with a Microsoft Learn / docs.microsoft.com link.

---

## Routing — which output goes where

| Prompt | Modell | Erwarteter Output | Ablage |
|--------|--------|-------------------|--------|
| 1 | Gemini 3 Pro DR | Markt-/Tech-Landscape, Vergleichstabellen | `docs/research/phase-7/gemini-landscape.md` |
| 2 | Kimi K2.6 DR | Asia-Ecosystem + Implementation Depth | `docs/research/phase-7/kimi-deepresearch.md` |
| 3 | Kimi K2 Coding | Spike-Repo Code-Files + ADR-Draft | `apps/web/src/three/**` + `docs/adr/0006-…` |
| 4 | MS 365 Copilot | MS-Stack Empfehlung | `docs/research/phase-7/ms-copilot-lens.md` |

Nach allen Runs: Claude Opus 4.6 macht Synthese → finale `docs/adr/0006-phase7-immersive-stack.md`.
