import { describe, expect, it } from "vitest";

import { artworkSchema, profileSchema } from "./schemas.js";
import { mapDbArtworkRow, mapDbProfileRow } from "./transformers.js";

describe("contracts schemas", () => {
  it("parses profile rows from snake_case", () => {
    const profile = mapDbProfileRow({
      id: "11111111-1111-1111-1111-111111111111",
      display_name: "Mila Hartmann",
      portrait_url: "https://cdn.elbtronika.art/portraits/mila.jpg",
      role: "artist",
      country_code: "DE",
      stripe_account_id: "acct_artist_001",
      created_at: "2026-04-29T00:00:00.000Z",
      updated_at: "2026-04-29T00:00:00.000Z",
    });

    expect(profileSchema.parse(profile).displayName).toBe("Mila Hartmann");
  });

  it("maps and validates artwork rows", () => {
    const artwork = mapDbArtworkRow({
      id: "ccccccc1-cccc-cccc-cccc-ccccccccccc1",
      slug: "lichtfenster-i",
      artist_id: "11111111-1111-1111-1111-111111111111",
      dj_id: "44444444-4444-4444-4444-444444444444",
      room_id: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
      set_id: "bbbbbbb1-bbbb-bbbb-bbbb-bbbbbbbbbbb1",
      title_de: "Lichtfenster I",
      title_en: "Light Window I",
      story_de: [],
      story_en: [],
      price_cents: 145000,
      currency: "EUR",
      medium: "C-Print hinter Acryl",
      dimensions: { widthCm: 120, heightCm: 90 },
      image_url: "https://cdn.elbtronika.art/artworks/lichtfenster-i.jpg",
      gltf_url: null,
      textures: ["https://cdn.elbtronika.art/textures/lichtfenster-i.ktx2"],
      status: "published",
      published_at: "2026-04-29T00:00:00.000Z",
      created_at: "2026-04-29T00:00:00.000Z",
      updated_at: "2026-04-29T00:00:00.000Z",
    });

    expect(artworkSchema.parse(artwork).title.de).toBe("Lichtfenster I");
  });
});
