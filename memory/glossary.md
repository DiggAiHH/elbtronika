# Glossary — ELBTRONIKA Decoder Ring

## Projekt-Begriffe

| Term | Bedeutung |
|------|-----------|
| ELBTRONIKA | Hauptprojekt, Name-Ableitung Elbe + Elektronika (elektronische Musik) |
| Immersive Mode | 3D-Raum-Ansicht mit Spatial Audio — Emotions-/Entdeckungsmodus |
| Classic Mode | 2D-Shop-Grid — Conversion-/Kaufmodus |
| Mode Transition | 1200ms choreographed Wechsel zwischen Immersive und Classic |
| Room | 3D-Szenen-Einheit mit Wänden, Beleuchtung, bis zu N Artwork-Slots |
| Artwork-Slot | Position für ein Kunstwerk im Room, konfiguriert via Sanity |
| Single Canvas | Architektur-Prinzip: WebGPU-Canvas bleibt persistent, nie unmounted |
| 60/20/20 | Revenue-Split Künstler / DJ / Plattform |
| Separate Charges and Transfers | Stripe-Pattern für Plattform-Zahlungen mit delayed Payouts |
| Transfer Group | Stripe-Attribut, verknüpft Charge mit mehreren Transfers |
| Proximity-System | Distanz Kamera ↔ Artwork, triggert Audio-Fade + UI-Hints |
| Proximity-Track | Aktiver Audio-Stream mit räumlichem Panning |
| Now Playing | Globale HUD-Komponente für aktuellen Track + Transport |

## Tech-Akronyme

| Term | Bedeutung |
|------|-----------|
| R3F | React Three Fiber |
| TSL | Three.js Shading Language (ersetzt GLSL) |
| KTX2 | GPU-optimiertes Textur-Format (Draco-Alternative für Bilder) |
| Draco | GLTF-Mesh-Kompressionsformat |
| HLS | HTTP Live Streaming |
| RLS | Row Level Security (Postgres/Supabase) |
| SSR | Server Side Rendering |
| SPA | Single Page Application |
| ADR | Architecture Decision Record |
| DoD | Definition of Done |
| FOUC | Flash of Unstyled Content |
| CNIL | Commission nationale de l'informatique et des libertés (Frz. Datenschutzbehörde) |
| DSGVO / GDPR | Datenschutz-Grundverordnung / General Data Protection Regulation |
| DPMA | Deutsches Patent- und Markenamt |
| EUIPO | European Union Intellectual Property Office |
| AVV | Auftragsverarbeitungsvertrag |
| KYC | Know Your Customer |
| GROQ | Graph-Relational Object Queries (Sanity) |
| CMS | Content Management System |
| E2E | End-to-End (Tests) |
| FPS | Frames per second |
| VRAM | Video RAM / GPU-Speicher |

## Rollen

| Rolle | Beschreibung |
|-------|--------------|
| visitor | Ungelesener Gast, nur Browse |
| collector | Registrierter Käufer |
| artist | Kunstschaffender, hat Artworks, Stripe Connect Account |
| dj | DJ, hat Sets, Stripe Connect Account |
| curator | Review-/Freigabe-Rolle in Sanity |
| admin | Plattform-Betreiber (Lou) |

## Pipeline-Begriffe

| Term | Bedeutung |
|------|-----------|
| Phase 0–16 | 16 Architektur-Phasen über ~20–24 Wochen, sequenziell mit parallelen Blöcken |
| Critical Path | Phase 0 → 3 → 7 (Legal, Infra, Single Canvas) |
| Ground Zero | Start von Null, noch kein Commit im Repo |
| Claude-Pairing | Lou + Claude als Senior-Pair für Architekturentscheidungen |
