# ADR 0016: Spatial Audio Smoothing & HRTF Orientation

## Status
**Accepted** — 2026-04-29

## Context

Phase 8 (Spatial Audio) nutzte direkte `.value` Zuweisungen für Listener- und Source-Positionen. Das führte zu:
- Audio-Pops bei schnellen Kamerabewegungen
- Keine HRTF-Orientierung (Listener wusste nicht, in welche Richtung die Kamera schaut)
- Fehlende Directional-Audio-Unterstützung für Artwork-Beschreibungen

## Decision

### 1. Parameter Smoothing
- `setListenerPosition` nutzt jetzt `setTargetAtTime(timeConstant=0.01)` statt direkter `.value` Zuweisung
- `setSourcePosition` nutzt ebenfalls `setTargetAtTime(timeConstant=0.01)`
- `setListenerOrientation` neu implementiert mit `setTargetAtTime` für Forward/Up-Vektoren

### 2. Listener Orientation
- `useProximityAudio` akzeptiert neuen Parameter `getCameraOrientation`
- R3F-Kamera-Quaternion wird in Forward/Up-Vektoren umgerechnet
- HRTF (`panningModel = "HRTF"`) kann nun korrekt räumlich auflösen

### 3. Directional Audio
- `SourceConfig` Interface hinzugefügt für `coneInnerAngle`, `coneOuterAngle`, `coneOuterGain`
- Artwork-Description-Streams werden als `directional: true` mit `coneInnerAngle=60` registriert
- Beschreibungen sind nur hörbar, wenn der Betrachter in Richtung des Artworks schaut

### 4. Manual computeGain Deprecated
- `computeGain` ist als `@deprecated` markiert
- `PannerNode.distanceModel = "inverse"` handhabt Gain nativ genauer

## Consequences

### Positive
- Keine Audio-Pops mehr bei schnellen Bewegungen
- Realistischere räumliche Auflösung durch HRTF-Orientierung
- Immersivere Artwork-Beschreibungen durch Directional Audio

### Negative
- `setTargetAtTime` erfordert AudioContext-Zeitberechnung (komplexer als direkte Zuweisung)
- `getCameraOrientation` muss von Callern bereitgestellt werden (API-Änderung)
