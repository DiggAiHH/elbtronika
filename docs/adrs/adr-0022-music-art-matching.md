# ADR 0022: Music-Art Matching Engine

## Status
Accepted — 2026-04-29

## Context
ELBTRONIKA's Kern-DNA ist die Verbindung von Techno-Musik mit bildender Kunst. Wir wollen AI-gestützte Kuration: Ein DJ-Set soll automatisch passende Kunstwerke finden.

## Decision
Wir bauen eine **Music-Art Matching Engine** in `packages/flow/`:

### Audio-Analyse
- BPM Detection (autocorrelation-based)
- Key Detection (heuristisch)
- Spectral Features (Centroid, RMS, ZCR)
- Mood Extraction (Valence/Arousal aus Spectral Features)

### Art-Analyse
- Color Palette (Histogram-Bucketing)
- Composition Score (Rule of Thirds)
- Style/Mood Tags (heuristisch aus Farben)

### Matching
- Gemeinsamer Embedding-Space (16-25 Dim)
- Cosine Similarity
- Weighted Breakdown: Mood (35%), Energy (25%), Color (20%), Composition (20%)
- Diversification: Stil-Variety garantiert

## Datenmodell
```sql
audio_features(set_id, bpm, key, valence, arousal, embedding)
artwork_features(artwork_id, dominant_colors, composition_score, embedding)
music_art_matches(set_id, artwork_id, similarity_score, match_reason)
```

## Consequences
- **Positive**: Skalierbare Kuration; quantifizierbare Matches; Kurator-Feedback loop möglich
- **Negative**: Heuristische Analyse ist nicht perfekt; echte Audio-Analyse braucht WAV/MP3 Download

## Alternatives Considered
- Spotify API (nur für Spotify-Tracks, nicht für DJ-Sets)
- Essentia.js (WASM, zu schwer für MVP)
- Manueller Kurator (nicht skalierbar)
