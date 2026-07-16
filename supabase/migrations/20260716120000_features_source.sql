-- Provenance for flow features: measured (real DSP over decoded media) vs
-- simulated (deterministic placeholder). The API returns this column so
-- clients can honestly label scores — Ehrlichkeits-Regel, Architekturplan v1.5 §1.7.

ALTER TABLE audio_features
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'simulated'
  CHECK (source IN ('simulated', 'measured'));

ALTER TABLE artwork_features
  ADD COLUMN IF NOT EXISTS source TEXT NOT NULL DEFAULT 'simulated'
  CHECK (source IN ('simulated', 'measured'));

COMMENT ON COLUMN audio_features.source IS 'measured = packages/flow analyzeAudio() over decoded audio; simulated = deterministic placeholder';
COMMENT ON COLUMN artwork_features.source IS 'measured = packages/flow analyzeArt() over decoded pixels; simulated = deterministic placeholder';
