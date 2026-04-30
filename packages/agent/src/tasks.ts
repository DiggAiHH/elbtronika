/**
 * 10 Real-World Tasks for Hermes Agent Evaluation
 * Each task tests a different aspect of ELBTRONIKA operations.
 */

import type { AgentTaskType } from "./types";

export interface BenchmarkTask {
  id: string;
  type: AgentTaskType;
  goal: string;
  context: Record<string, unknown>;
  expectedSkills: string[];
  expectedTools: string[];
  difficulty: "easy" | "medium" | "hard";
}

export const benchmarkTasks: BenchmarkTask[] = [
  {
    id: "task-001-curate-room-techno",
    type: "curate",
    goal: "Curate 5 artworks for Room 1 ('Der Keller') that match a 130 BPM dark techno set by DJ Nika",
    context: { roomSlug: "der-keller", djName: "Nika", bpm: 130, genre: "techno", mood: "dark" },
    expectedSkills: ["curate_room"],
    expectedTools: ["audio_analyze_track", "supabase_query_artworks", "audio_match_artwork_to_track"],
    difficulty: "medium",
  },
  {
    id: "task-002-onboard-artist",
    type: "onboard",
    goal: "Onboard a new artist named Lena Schmidt: create profile, initiate Stripe Connect, collect first artwork metadata",
    context: { artistName: "Lena Schmidt", email: "lena@studio.art", medium: "digital painting" },
    expectedSkills: ["onboard_artist"],
    expectedTools: ["supabase_insert", "stripe_get_account_balance"],
    difficulty: "hard",
  },
  {
    id: "task-003-analyze-sales-q1",
    type: "analyze",
    goal: "Analyze Q1 2026 sales: total revenue, top 3 artists by payout, average order value",
    context: { quarter: "Q1-2026", startDate: "2026-01-01", endDate: "2026-03-31" },
    expectedSkills: ["analyze_sales"],
    expectedTools: ["supabase_query", "stripe_list_transfers"],
    difficulty: "medium",
  },
  {
    id: "task-004-generate-descriptions",
    type: "custom",
    goal: "Generate 3 gallery-quality descriptions for an artwork with bullets: neon, Berlin club, kinetic sculpture, LED strips",
    context: { bullets: ["neon", "Berlin club culture", "kinetic sculpture", "LED strips"], language: "de" },
    expectedSkills: ["generate_artwork_description"],
    expectedTools: [],
    difficulty: "easy",
  },
  {
    id: "task-005-match-set-to-art",
    type: "curate",
    goal: "Find the best matching artwork for DJ set ID 'set-nina-001' using audio feature analysis",
    context: { setId: "set-nina-001", limit: 3 },
    expectedSkills: ["curate_room"],
    expectedTools: ["audio_analyze_track", "audio_match_artwork_to_track"],
    difficulty: "medium",
  },
  {
    id: "task-006-health-check",
    type: "test",
    goal: "Run a full system health check: verify database connectivity, Sanity API, Stripe API, and report any degraded services",
    context: { checkDatabase: true, checkSanity: true, checkStripe: true },
    expectedSkills: [],
    expectedTools: ["supabase_query"],
    difficulty: "easy",
  },
  {
    id: "task-007-research-trends",
    type: "research",
    goal: "Research current digital art trends for 2026: identify 3 emerging styles that fit ELBTRONIKA's techno-art aesthetic",
    context: { year: 2026, aesthetic: "techno-art", limit: 3 },
    expectedSkills: [],
    expectedTools: ["sanity_list_artworks"],
    difficulty: "hard",
  },
  {
    id: "task-008-refund-handling",
    type: "custom",
    goal: "Process a refund for order ORD-2026-0042: verify payment status, initiate Stripe refund, update order status to refunded",
    context: { orderId: "ORD-2026-0042", reason: "customer_request" },
    expectedSkills: [],
    expectedTools: ["stripe_refund_payment", "supabase_update"],
    difficulty: "medium",
  },
  {
    id: "task-009-curate-room-ambient",
    type: "curate",
    goal: "Curate 3 ambient/chill artworks for the Lobby room that match a 100 BPM ambient set",
    context: { roomSlug: "lobby", bpm: 100, genre: "ambient", mood: "chill", limit: 3 },
    expectedSkills: ["curate_room"],
    expectedTools: ["audio_analyze_track", "supabase_query_artworks", "audio_match_artwork_to_track"],
    difficulty: "easy",
  },
  {
    id: "task-010-generate-monthly-report",
    type: "analyze",
    goal: "Generate a monthly platform report for April 2026: new artists, artworks sold, total GMV, top DJ-artwork pairings",
    context: { month: "2026-04", metrics: ["new_artists", "artworks_sold", "gmv", "top_pairings"] },
    expectedSkills: ["analyze_sales"],
    expectedTools: ["supabase_query", "stripe_list_transfers"],
    difficulty: "hard",
  },
];
