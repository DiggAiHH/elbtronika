/**
 * Skill Registry — procedural memory for reusable agent capabilities.
 * Skills follow the agentskills.io open format.
 */

import type { Skill } from "./types";

export class SkillRegistry {
  private skills = new Map<string, Skill>();
  // private autoSaveDir = "./agent-workspace/skills";

  register(skill: Skill): void {
    this.skills.set(skill.name, skill);
  }

  get(name: string): Skill | undefined {
    return this.skills.get(name);
  }

  findByTrigger(goal: string): Skill[] {
    const lower = goal.toLowerCase();
    return Array.from(this.skills.values()).filter((s) =>
      s.triggerPatterns.some((p) => lower.includes(p.toLowerCase()))
    );
  }

  list(): Skill[] {
    return Array.from(this.skills.values());
  }

  /** Auto-generate a skill from a successful task trajectory */
  learnFromTask(
    name: string,
    description: string,
    goalPattern: string,
    steps: string[],
    toolsUsed: string[]
  ): Skill {
    const skill: Skill = {
      id: `skill-${Date.now()}`,
      name,
      description,
      triggerPatterns: [goalPattern],
      steps,
      toolsUsed,
      successRate: 1.0,
      usageCount: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.register(skill);
    return skill;
  }

  /** Update success rate after using a skill */
  recordOutcome(name: string, success: boolean): void {
    const skill = this.skills.get(name);
    if (!skill) return;
    const total = skill.usageCount + 1;
    const successes = skill.successRate * skill.usageCount + (success ? 1 : 0);
    skill.successRate = successes / total;
    skill.usageCount = total;
    skill.updatedAt = new Date().toISOString();
  }

  /** Built-in skills for ELBTRONIKA */
  loadBuiltInSkills(): void {
    this.register({
      id: "skill-curate-room",
      name: "curate_room",
      description: "Select artworks for a gallery room based on a DJ set's mood and energy.",
      triggerPatterns: ["curate", "select artworks", "room", "gallery", "match music"],
      steps: [
        "Analyze the DJ set's audio features (BPM, key, mood)",
        "Query artworks from database with status=published",
        "Calculate similarity scores between audio features and artwork features",
        "Select top N matches with diverse styles",
        "Return curated list with reasoning",
      ],
      toolsUsed: ["audio_analyze_track", "supabase_query_artworks", "audio_match_artwork_to_track"],
      successRate: 0.95,
      usageCount: 10,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.register({
      id: "skill-onboard-artist",
      name: "onboard_artist",
      description: "Guide a new artist through profile setup, Stripe Connect, and first artwork upload.",
      triggerPatterns: ["onboard", "new artist", "register artist", "artist signup"],
      steps: [
        "Check if profile exists, create if not",
        "Verify artist role in profiles table",
        "Initiate Stripe Connect onboarding",
        "Collect artwork metadata and images",
        "Create artwork draft in Sanity",
        "Confirm completion and send welcome message",
      ],
      toolsUsed: ["supabase_query", "supabase_insert", "stripe_get_account_balance"],
      successRate: 0.88,
      usageCount: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.register({
      id: "skill-analyze-sales",
      name: "analyze_sales",
      description: "Analyze sales data and generate revenue reports for artists.",
      triggerPatterns: ["sales", "revenue", "report", "earnings", "payout"],
      steps: [
        "Query orders for the artist within date range",
        "Query Stripe transfers for the artist",
        "Calculate total revenue, fees, and net payout",
        "Generate formatted report",
      ],
      toolsUsed: ["supabase_query", "stripe_list_transfers"],
      successRate: 0.92,
      usageCount: 7,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    this.register({
      id: "skill-generate-description",
      name: "generate_artwork_description",
      description: "Generate gallery-quality artwork descriptions from artist bullet points.",
      triggerPatterns: ["description", "artwork text", "gallery text", "write about art"],
      steps: [
        "Receive bullet points from artist",
        "Select tone (poetic, factual, gallery)",
        "Generate 3 variant descriptions via AI",
        "Return variants for artist selection",
      ],
      toolsUsed: ["ai_generate_description"],
      successRate: 0.98,
      usageCount: 25,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}
