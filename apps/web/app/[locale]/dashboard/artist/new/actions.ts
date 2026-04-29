"use server";

// Server Action: create artwork draft in Supabase
// Eselbrücke: "filing clerk" — takes the form, stamps "DRAFT", files it

import { createClient } from "@/src/lib/supabase/server";

interface CreateArtworkDraftInput {
  title: string;
  medium?: string | undefined;
  dimensions?: string | undefined;
  year?: number | undefined;
  priceEur?: number | undefined;
  editionSize?: number | undefined;
  genreTags?: string[] | undefined;
  imageUrl?: string | undefined;
  imageR2Key?: string | undefined;
}

export async function createArtworkDraft(
  input: CreateArtworkDraftInput,
): Promise<{ error: string } | { id: string }> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Look up the artist row for this user
  const { data: artistRow, error: artistError } = await supabase
    .from("artists")
    .select("id")
    .eq("profile_id", user.id)
    .single();

  if (artistError || !artistRow) {
    return { error: "Artist profile not found. Complete your profile first." };
  }

  // Generate a slug from the title
  const slug = `${input.title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}-${Date.now()}`;

  const { data, error } = await supabase
    .from("artworks")
    .insert({
      artist_id: artistRow.id,
      slug,
      title: input.title,
      medium: input.medium ?? null,
      dimensions: input.dimensions ?? null,
      year: input.year ?? null,
      ...(input.priceEur !== undefined && { price_eur: input.priceEur }),
      edition_size: input.editionSize ?? null,
      genre_tags: input.genreTags ?? [],
      image_url: input.imageUrl ?? null,
      is_published: false, // always draft on creation
      // sanity_id is null until CMS publishes
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createArtworkDraft] DB error:", error.message);
    return { error: "Failed to save artwork. Please try again." };
  }

  return { id: data.id };
}
