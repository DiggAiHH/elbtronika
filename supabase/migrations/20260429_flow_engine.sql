-- Flow Engine Migration: Music-Art Matching
-- Creates tables for audio features, artwork features, and match results.

-- Enable pgvector extension (if available; otherwise embedding is stored as jsonb)
-- CREATE EXTENSION IF NOT EXISTS vector;

-- Audio features extracted from DJ sets
CREATE TABLE IF NOT EXISTS audio_features (
  set_id UUID PRIMARY KEY REFERENCES sets(id) ON DELETE CASCADE,
  bpm NUMERIC,
  key VARCHAR(10),
  valence NUMERIC CHECK (valence >= 0 AND valence <= 1),
  arousal NUMERIC CHECK (arousal >= 0 AND arousal <= 1),
  spectral_centroid NUMERIC,
  mood_tags TEXT[] DEFAULT '{}',
  embedding JSONB DEFAULT '[]', -- 128-dim vector as JSON array
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artwork features extracted from images
CREATE TABLE IF NOT EXISTS artwork_features (
  artwork_id UUID PRIMARY KEY REFERENCES artworks(id) ON DELETE CASCADE,
  dominant_colors JSONB DEFAULT '[]',
  color_harmony VARCHAR(20) DEFAULT 'complex',
  brightness NUMERIC CHECK (brightness >= 0 AND brightness <= 1),
  contrast NUMERIC CHECK (contrast >= 0 AND contrast <= 1),
  saturation NUMERIC CHECK (saturation >= 0 AND saturation <= 1),
  composition_score NUMERIC CHECK (composition_score >= 0 AND composition_score <= 1),
  symmetry_score NUMERIC CHECK (symmetry_score >= 0 AND symmetry_score <= 1),
  style_tags TEXT[] DEFAULT '{}',
  mood_tags TEXT[] DEFAULT '{}',
  complexity NUMERIC CHECK (complexity >= 0 AND complexity <= 1),
  embedding JSONB DEFAULT '[]', -- 128-dim vector as JSON array
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Music-Art match results
CREATE TABLE IF NOT EXISTS music_art_matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id UUID REFERENCES sets(id) ON DELETE CASCADE,
  artwork_id UUID REFERENCES artworks(id) ON DELETE CASCADE,
  similarity_score NUMERIC CHECK (similarity_score >= 0 AND similarity_score <= 1),
  match_reason TEXT,
  curator_approved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(set_id, artwork_id)
);

-- Agent task log (for PM dashboard)
CREATE TABLE IF NOT EXISTS agent_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type VARCHAR(50) NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  goal TEXT NOT NULL,
  plan JSONB DEFAULT '[]',
  result JSONB,
  error TEXT,
  assigned_agent VARCHAR(100) DEFAULT 'hermes-curator',
  context JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ
);

-- Agent episodic memory
CREATE TABLE IF NOT EXISTS agent_episodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES agent_tasks(id) ON DELETE CASCADE,
  goal TEXT NOT NULL,
  outcome VARCHAR(20) CHECK (outcome IN ('success', 'failure', 'partial')),
  key_observations JSONB DEFAULT '[]',
  lessons JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_audio_features_set ON audio_features(set_id);
CREATE INDEX IF NOT EXISTS idx_artwork_features_artwork ON artwork_features(artwork_id);
CREATE INDEX IF NOT EXISTS idx_matches_set ON music_art_matches(set_id);
CREATE INDEX IF NOT EXISTS idx_matches_artwork ON music_art_matches(artwork_id);
CREATE INDEX IF NOT EXISTS idx_matches_score ON music_art_matches(similarity_score DESC);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_status ON agent_tasks(status);
CREATE INDEX IF NOT EXISTS idx_agent_tasks_type ON agent_tasks(type);

-- RLS policies (enable if needed)
-- ALTER TABLE audio_features ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE artwork_features ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE music_art_matches ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agent_tasks ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE agent_episodes ENABLE ROW LEVEL SECURITY;

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_audio_features_updated_at BEFORE UPDATE ON audio_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_artwork_features_updated_at BEFORE UPDATE ON artwork_features
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
