import { groq } from "next-sanity";

// ---------------------------------------------------------------------------
// Fragments (reused across queries)
// ---------------------------------------------------------------------------

const imageFragment = groq`{
  asset->{ url, metadata { dimensions, lqip } },
  hotspot,
  crop,
  alt
}`;

const slugFragment = groq`{ current }`;

// ---------------------------------------------------------------------------
// Artist
// ---------------------------------------------------------------------------

export const allArtistsQuery = groq`
  *[_type == "artist" && defined(slug.current)] | order(name asc) {
    _id,
    supabaseId,
    slug ${slugFragment},
    name,
    avatar ${imageFragment},
    genreTags
  }
`;

export const artistBySlugQuery = groq`
  *[_type == "artist" && slug.current == $slug][0] {
    _id,
    supabaseId,
    slug ${slugFragment},
    name,
    bio,
    avatar ${imageFragment},
    genreTags,
    website,
    instagram
  }
`;

// ---------------------------------------------------------------------------
// Artwork
// ---------------------------------------------------------------------------

export const allArtworksQuery = groq`
  *[_type == "artwork" && defined(slug.current)] | order(year desc) {
    _id,
    supabaseId,
    slug ${slugFragment},
    title,
    artist->{ _id, name, slug ${slugFragment} },
    image ${imageFragment},
    medium,
    year,
    genreTags
  }
`;

export const artworkBySlugQuery = groq`
  *[_type == "artwork" && slug.current == $slug][0] {
    _id,
    supabaseId,
    slug ${slugFragment},
    title,
    artist->{ _id, name, slug ${slugFragment}, avatar ${imageFragment} },
    description,
    image ${imageFragment},
    medium,
    dimensions,
    year,
    genreTags,
    featuredInRoom->{ _id, title, slug ${slugFragment} }
  }
`;

// ---------------------------------------------------------------------------
// DJ
// ---------------------------------------------------------------------------

export const allDjsQuery = groq`
  *[_type == "dj" && defined(slug.current)] | order(name asc) {
    _id,
    supabaseId,
    slug ${slugFragment},
    name,
    avatar ${imageFragment},
    genreTags
  }
`;

export const djBySlugQuery = groq`
  *[_type == "dj" && slug.current == $slug][0] {
    _id,
    supabaseId,
    slug ${slugFragment},
    name,
    bio,
    avatar ${imageFragment},
    genreTags,
    website,
    instagram,
    soundcloud
  }
`;

// ---------------------------------------------------------------------------
// DJ Set
// ---------------------------------------------------------------------------

export const allSetsQuery = groq`
  *[_type == "set" && defined(slug.current)] | order(_createdAt desc) {
    _id,
    supabaseId,
    slug ${slugFragment},
    title,
    dj->{ _id, name, slug ${slugFragment} },
    coverImage ${imageFragment},
    genreTags,
    bpm,
    durationMin
  }
`;

export const setBySlugQuery = groq`
  *[_type == "set" && slug.current == $slug][0] {
    _id,
    supabaseId,
    slug ${slugFragment},
    title,
    dj->{ _id, name, slug ${slugFragment}, avatar ${imageFragment} },
    description,
    coverImage ${imageFragment},
    genreTags,
    bpm,
    durationMin,
    tracklist[] {
      position,
      artist,
      track,
      label
    }
  }
`;

// ---------------------------------------------------------------------------
// Room (3D Space)
// ---------------------------------------------------------------------------

export const allRoomsQuery = groq`
  *[_type == "room" && defined(slug.current)] | order(_createdAt desc) {
    _id,
    slug ${slugFragment},
    title,
    coverImage ${imageFragment}
  }
`;

export const roomBySlugQuery = groq`
  *[_type == "room" && slug.current == $slug][0] {
    _id,
    slug ${slugFragment},
    title,
    description,
    coverImage ${imageFragment},
    environment {
      skyboxUrl,
      ambientLightIntensity,
      fogDensity
    },
    artworks[] {
      artwork->{ _id, title, image ${imageFragment}, slug ${slugFragment} },
      position { x, y, z },
      rotation
    },
    featuredSet->{ _id, title, slug ${slugFragment}, dj->{ name } }
  }
`;

// ---------------------------------------------------------------------------
// Story / Editorial
// ---------------------------------------------------------------------------

export const allStoriesQuery = groq`
  *[_type == "story" && defined(publishedAt)] | order(publishedAt desc) {
    _id,
    slug ${slugFragment},
    title,
    subtitle,
    coverImage ${imageFragment},
    author,
    publishedAt,
    tags
  }
`;

export const storyBySlugQuery = groq`
  *[_type == "story" && slug.current == $slug][0] {
    _id,
    slug ${slugFragment},
    title,
    subtitle,
    coverImage ${imageFragment},
    author,
    publishedAt,
    body,
    tags,
    relatedArtists[]->{ _id, name, slug ${slugFragment}, avatar ${imageFragment} },
    relatedArtworks[]->{ _id, title, slug ${slugFragment}, image ${imageFragment} }
  }
`;
