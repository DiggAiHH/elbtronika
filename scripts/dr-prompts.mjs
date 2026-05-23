// Deep-Research Prompts für ELBTRONIKA — versioniert + austauschbar.
// Aufruf: pnpm dr:blast 1 2 4   →  feuert Prompts 1, 2, 4 parallel.
// Edit hier → neue Forschungs-Runde.

export const PROMPTS = {
  1: {
    platform: "gemini",
    title: "3D + AI + Avatars + Metaverse — Open Web 2026",
    body: `ROLE: Senior research analyst for an immersive web platform combining electronic music, visual art and 3D galleries. Deliver a comprehensive, source-backed landscape analysis of 3D + AI + voice + avatars + metaverse as of Q2 2026 — focused on what is shippable on the OPEN WEB (no walled gardens) using WebGPU, Three.js, React Three Fiber, Web Audio API.

CONTEXT: ELBTRONIKA is an immersive 3D online gallery merging electronic music (DJs) with visual art. Core feature: seamless transition between Immersive Mode (3D + Spatial Audio, WebGPU) and Classic Mode (Shop-Grid). Revenue split 60/20/20 (Artist / DJ / Platform). Stack: Next.js 15, React 19, Three.js r184, R3F v9, WebGPURenderer (WebGL2 fallback), Web Audio API + PannerNode, Supabase EU-Frankfurt, Sanity, Cloudflare R2, Stripe Connect. Hosted in EU only.

DELIVERABLES:
1) STATE OF THE ART — 3D ON THE WEB 2026. WebGPU adoption, Three.js r184+ vs Babylon.js 7, R3F v9 ecosystem, performance benchmarks (draw calls, instancing, BVH, Nanite-style virtual geometry on web), notable production deployments. Browser support matrix.
2) AI-GENERATED 3D pipelines: Luma Genie, Meshy, CSM.ai, Tripo3D, NVIDIA Edify 3D, Adobe Substance 3D Sampler, Stable Fast 3D, MS Trellis, OpenAI Shap-E successors. Compare input modality, output format, polycount, licensing, API pricing, latency. Which are realistic for 50–500 assets/month?
3) GAUSSIAN SPLATTING + NeRF for galleries. State of WebGL/WebGPU splat renderers (antimatter15, gsplat.js, Spark.art, Polycam viewer, SuperSplat). Performance, file sizes, R3F integration.
4) VOICE + AVATARS 2026. RPM, Meta Avatars Web, Apple Persona, Inworld, Convai, NVIDIA Audio2Face-3D, ElevenLabs Conversational AI, HeyGen, Synthesia. Lip-sync viseme accuracy, <300ms latency, DE/EN coverage, GDPR.
5) SPATIAL AUDIO + WEBGPU. PannerNode 2026, HRTF, Apple Spatial Audio web, Dolby Atmos Web, IAMF. Best practices syncing audio to 3D scene in R3F.
6) METAVERSE INTEROP STANDARDS 2026. OpenXR for web, OMI3, KHR_audio, KHR_node_visibility, VRM 1.0, USD on Web (USDZ WebKit, Hydra), W3C Immersive Web (WebXR Device API, WebXR Layers). Which adopted by ≥2 majors?
7) COMPETITIVE LANDSCAPE — Sansar, VRChat music, Roblox concerts, Fortnite Soundwave, Decentraland Music Festival, Spatial.io, Mozilla Hubs Foundation, Frame.io, Museum of Other Realities. Business models, retention metrics.
8) RECOMMENDATIONS. Top-3 stacks for ELBTRONIKA Single Canvas. For each: pros, cons, integration cost (engineer-weeks), licensing/runtime cost @ 10k MAU.

CONSTRAINTS: Cite primary sources (papers, GitHub repos, vendor docs, SIGGRAPH 2025 / Web3D / I/O 2025 / WWDC 2025). Avoid blog spam. Prefer open-source/open-standard. GDPR + EU AI Act non-negotiable. HYPE-vs-PRODUCTION calibration column for every tech. Output as Markdown with H2/H3, comparison tables, final TL;DR scorecard.`,
  },
  2: {
    platform: "kimi",
    title: "Asian AI 3D + Avatar Stack — Western-blind-spots",
    body: `ROLE: Technical researcher with deep access to both Western and Asian (CN/JP/KR) sources on real-time 3D graphics, AI 3D generation, and avatar tech. Building ELBTRONIKA — WebGPU immersive gallery for electronic music + visual art on the open web. Surface tech otherwise missed because most Western research ignores Chinese/Asian ecosystems.

CONTEXT: Stack Next.js 15, React 19, Three.js r184, R3F v9 + Drei v10, WebGPURenderer (WebGL2 fallback), Web Audio API + PannerNode, hls.js, Zustand v5, Supabase EU-Frankfurt, Cloudflare R2, Stripe Connect. Hosted EU only. Solo builder from Hamburg.

QUESTIONS:
1) CHINESE AI 3D GENERATION 2026: Tencent Hunyuan3D-2.0, Alibaba Tongyi 3D, ByteDance EnvyEditor/Volcano Engine 3D, Rhino3D (Yuanshi), Tripo3D (formerly DeepSeek 3D), Vast.ai Tripo. Compare open-weights availability, VRAM, quality vs Luma/Meshy, REST API EU-reachable, ToS for commercial use outside CN.
2) TENCENT / NETEASE METAVERSE INFRA — Tencent Cloud Metaverse Engine, NetEase Yaotai, ByteDance PICO Worlds web SDK. Realistic API integration for non-CN dev?
3) ASIAN AVATAR + VOICE — SenseTime Avatar, Tencent Virtual Avatar, MiniMax Conversational AI, Moonshot Kimi voice, Alibaba Qwen-Audio. Compare vs RPM + ElevenLabs on latency, Mandarin/Japanese/Korean AND German/English. Pricing USD/EUR.
4) WEBGPU PRODUCTION DEPLOYMENTS IN ASIA — Tencent QQ Web 3D, Baidu Apollo Web, NetEase ePic, BiliBili 3D Viewer. Performance reports.
5) SPATIAL AUDIO — Sony 360 Reality Audio web playback, Huawei AudioVivid, Tencent Audio Lab spatial, IAMF latest profile support.
6) REUSABLE CODE PATTERNS — TS / R3F v9 + Three.js r184 snippets for: (a) WebGPURenderer + WebGL2 fallback, (b) Single Canvas pattern shop-grid ↔ immersive without remount, (c) PannerNode bound to R3F mesh position, (d) RPM avatar loaded into R3F with morph-target viseme lip-sync from audio stream. Cite GitHub.
7) ENGINEERING-HARNESS AUTOMATION — MCPs, CLIs, AI tools (global) 2026 for: auto-generating 3D scenes from Sanity CMS schemas, scaffolding R3F components from Figma, generating Three.js TSL shader code from natural language, automated Lighthouse-equivalent for WebGPU pages.

OUTPUT: One section per question. For each tech: table Name | Origin | Open? | API EU-reachable | EUR/1k calls | Quality 1-5 | Best-for-ELBTRONIKA y/n + reason. End with "Top 5 things ELBTRONIKA should adopt that Western-only research would have missed" + 100-line code skeleton for Single Canvas WebGPU transition.`,
  },
  4: {
    platform: "copilot",
    title: "Microsoft-Stack Eval für ELBTRONIKA",
    body: `ROLE: Senior solutions architect on the Microsoft platform. Evaluate ELBTRONIKA — an immersive 3D web gallery for electronic music + art (Next.js + Three.js + WebGPU + Supabase) — through the lens of the Microsoft ecosystem. I am NOT switching off Supabase/Cloudflare/Anthropic, but want to know which Microsoft pieces are worth bolting on selectively. Solo builder from Hamburg, EU-only hosting.

COVER:
1) MICROSOFT MESH 2026 — SDK status for web (not just Teams). Avatar interop with VRM / RPM. Mesh avatars in non-Teams web apps? Licensing.
2) AZURE AI SPEECH & AVATAR (TTS Avatar, Custom Neural Voice). Real-time avatar latency, EU residency (Germany West Central, Sweden Central), pricing per stream-minute, German neural voices, GDPR + EU AI Act risk class.
3) AZURE OPENAI vs ANTHROPIC CLAUDE (already in stack). Add Azure OpenAI as backup for AI art descriptions / DJ-set tagging? Cost @ 10M tokens/month, EU latency, content-filter friction for music/art.
4) MICROSOFT FABRIC / POWER BI for 60/20/20 revenue dashboard. Worth it vs in-house Recharts? GDPR for Power BI → Supabase Postgres EU-Frankfurt.
5) GITHUB COPILOT WORKSPACE + COPILOT AGENTS — multi-file agent workflows on pnpm + Turborepo. Compare vs Claude Code (already used) and Cursor.
6) MICROSOFT ENTRA ID EXTERNAL IDENTITIES — alternative to Supabase Auth for artist/DJ accounts? Realistic for solo builder or overkill?
7) RECOMMENDATION: bullet list "adopt now" / "evaluate in 6 months" / "ignore" — explicitly for solo builder shipping music+art platform out of Hamburg/Germany.

FORMAT: Markdown, max 1500 words, tables where useful, every claim with a Microsoft Learn / docs.microsoft.com link. Use Researcher / Think Deeper mode for sourced answer.`,
  },
};

export const PLATFORMS = {
  gemini: {
    url: "https://gemini.google.com/app",
    inputSel: 'div[contenteditable="true"][role="textbox"]',
    toolsBtnText: "Tools",
    drMenuText: "Deep Research",
    submitKey: "Enter",
    postSubmitClickText: "Start research",
    waitAfterSubmit: 5000,
  },
  kimi: {
    url: "https://www.kimi.com/deep-research",
    inputSel: 'textarea, div[contenteditable="true"]',
    submitKey: "Enter",
    waitAfterSubmit: 4000,
  },
  copilot: {
    url: "https://copilot.microsoft.com/",
    inputSel: 'textarea',
    submitKey: "Enter",
    waitAfterSubmit: 4000,
  },
};
