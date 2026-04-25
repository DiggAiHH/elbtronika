# ELBTRONIKA – Architektur- und Ausführungsplan v1.1

> **Dokument-Typ:** Principal Architect Execution Plan – Aktualisierte Version
> **Stand:** 25. April 2026
> **Autor:** Lou (diggai@tutanota.de) + Claude (Principal Architect)
> **Vorgänger:** `ELBTRONIKA_Architekturplan_v1.0.md` (Master-Architektur unverändert gültig)
> **Status:** PLAN – ausführbar in einer Sonnet-Folgesession nach Handover-Prompt
> **Begleitdokument:** `ELBTRONIKA_Sonnet_Handover_Prompt.md` (Initial-Prompt für neue Sonnet-Session)

---

## Changelog v1.0 → v1.1

| Aspekt | v1.0 | v1.1 |
|---|---|---|
| Rechtsform | offen | **UG (haftungsbeschränkt)** |
| Künstler-Akquise | offen | **3–5 Künstler bereits zugesagt** |
| Budget | offen | **1500–3500 € Initial-Budget bestätigt** |
| Lieferung | offen | **Physisch + Download-Code für DJ-Set** (Vinyl/USB Phase 2) |
| Sprachen | offen | **Deutsch primär + Englisch sekundär (i18n von Anfang an)** |
| Dev-Setup | offen | **Claude Code + Netlify CLI lokal auf Lou's Maschine** |
| MCP-Connectors | unspezifiziert | **Phase-für-Phase-Map mit konkreten Tool-Calls** |
| Claude Design | nicht erwähnt | **Externer Workflow für UI-Design (eigenes Token-Budget)** |
| Sonnet-Handover | nicht vorhanden | **Eigener Prompt + Plan-Konsumierbarkeit für leichtere Modelle** |

Alle inhaltlichen Phasen aus v1.0 bleiben **gültig**. Dieses Dokument ergänzt mit:
- Neuer Sektion 3.5 (Lou's verifizierte Antworten)
- Neuer Sektion 4.5 (i18n-Architektur)
- Neuer Sektion 6 (MCP-Connector-Map pro Phase)
- Neuer Sektion 7 (Claude Design Integration)
- Neuer Sektion 8 (Sonnet-Handover-Workflow)

---

## 3.5 Verifizierte Projekt-Parameter (Stand: Lou's Antwort vom 25.04.2026)

| Parameter | Wert | Konsequenz für den Plan |
|---|---|---|
| **Rechtsform** | UG (haftungsbeschränkt) | Phase 0.1.1 fixiert. Stammkapital min. 1€, real ~500€. Dauer Gründung: 2–4 Wochen via online-Notar (z.B. Firma.de, Ideal). |
| **Künstler-Pipeline** | 3–5 Künstler zugesagt | Phase 5+6 können mit echten Assets entwickelt werden. Verträge müssen in Phase 0.2 unterschrieben sein, **bevor** Sanity Schemas ausgerollt werden. |
| **DJ-Pipeline** | offen (Annahme: 2–3 noch zu akquirieren) | **Frage 1 v1.1:** Wie ist der Stand? Falls null: Akquise parallel zu Phase 0–3. Sonst Risiko Launch-Verzögerung. |
| **Budget Initial** | 1500–3500 € | Ausreichend für: UG-Gründung (~300€), Anwalt IT-Recht (~800–1500€), Markenanmeldung (~400€), 3 Monate Hosting (~600€), Reserve für Designtools/Assets (~500€). |
| **Lieferung physisch** | Ja, Lou versendet selbst | Phase 10.5 vereinfacht: keine Fulfillment-Integration nötig. Order-Dashboard mit Versand-Status reicht. Versandlabel-API (z.B. Shippo) optional Phase 2. |
| **Digital-Lieferung** | Download-Code für Exclusive Set | Phase 10.5: One-time-Token-System gegen Signed-URL aus R2. Vinyl/USB-Special-Editions bewusst auf v2 verschoben. |
| **Sprachen** | DE primär + EN sekundär | i18n-Setup in Phase 1 verpflichtend (nicht später). Siehe Sektion 4.5. |
| **Dev-Setup** | Claude Code + Netlify CLI lokal | Plan kann konkrete Shell-Befehle enthalten. Cowork wird nicht primärer Dev-Pfad. |

### Aktualisierte offene Fragen v1.1

- **Frage 1:** DJ-Akquise-Stand? Zahl + erwarteter Vertragsabschluss-Zeitpunkt?
- **Frage 2:** Welche Region für Versand? Nur DE? EU? Global? (beeinflusst Steuer + Zoll-Compliance bei physischen Originalen)
- **Frage 3:** Hast du bereits einen Sanity- oder Notion-Account für Doku, oder neu anlegen?
- **Frage 4:** Soll ich die UG-Gründungs-Schritte im Plan detaillieren oder vertraust du da auf den Online-Notar-Workflow eigenständig?

---

## 4.5 Internationalisierung (i18n) – nachgereicht

i18n von Anfang an saubererer als nachträglich. Architektonische Entscheidungen:

### 4.5.1 Routing
- Next.js App Router mit Locale-Prefix: `/de/...`, `/en/...`
- Default-Redirect: Browser-Sprache → passende Locale, Fallback DE.
- `next-intl` als Library (2026-Standard mit Server-Components-Support).

### 4.5.2 Content-Layer
- Sanity-Schemas mit lokalisierten String-Feldern: `{ de: '...', en: '...' }`.
- Structured-Text (PortableText) als Array of Locales.
- Künstler/DJ können Bio in beiden Sprachen pflegen, MVP: DE-only mit "Translate"-Button (Claude API auf Server) als optionaler Komfort.

### 4.5.3 UI-Strings
- Alle Microcopy in Locale-Files `messages/de.json`, `messages/en.json`.
- Type-safe via `next-intl`-Generated Types.
- ICU MessageFormat für Pluralisierung und Variablen.

### 4.5.4 Compliance & Legal
- Datenschutzerklärung, Impressum, AGB: zwingend zweisprachig (deutsche Version rechtsverbindlich, englische als Service).
- Hinweis im englischen Footer: "Legal documents in German are binding."

### 4.5.5 SEO
- `hreflang`-Tags pro Seite.
- Eigene Sitemap pro Locale.
- OG-Bilder pro Locale (Texte überlagern).

### 4.5.6 i18n-DoD
- Alle UI-Strings via Translation-Function.
- Snapshot-Test: jede Route in beiden Locales rendert ohne Fehler.
- Manuelle Review: Englische Übersetzung idiomatisch, nicht maschinell-stumpf.

---

## 6. MCP-Connector-Map (pro Phase)

> **Lese-Anleitung:** Diese Map zeigt, welche MCP-Tools du in welcher Phase nutzen solltest. In der Sonnet-Folgesession werden die genannten Connectors als deferred tools verfügbar sein – wenn du beim Sonnet einen Phase-Block startest, lädt er die zugehörigen Tools per ToolSearch.

### Phase 0 – Rechtliche Fundamente

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| Anwalt-Termin koordinieren | **Google Calendar** (`mcp__63478716__*`) | `suggest_time` + `create_event` für Vertragsdurchsicht |
| Künstler-Outreach | **Gmail** (`mcp__f8417681__*`) | `create_draft` für Künstler-Anschreiben (auf DE) |
| Verträge ablegen | **Google Drive** (`mcp__ec313e43__*`) | `create_file` mit Verträgen, `get_file_permissions` für Read-Only-Sharing mit Künstlern |
| PDFs (KYC, Vertragsunterzeichnung) | **PDF Tools** (`mcp__PDF_Tools_*`) | `read_pdf_content`, `extract_to_csv` für strukturierte Vertragsdaten |
| Künstler/DJ-Pipeline-Tracking | **Airtable** (`mcp__6ec78dc4__*`) | Base anlegen: "ELBTRONIKA Pipeline" mit Tabellen `Artists`, `DJs`, `Contracts`, `Status` |
| Marktforschung Konkurrenz | **Apify** (`mcp__Apify__*`) | `apify--rag-web-browser` auf vergleichbare Galerien (Niio, Sedition, Foundation) |

### Phase 1 – Repo & Tooling

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| File-System Repo-Init | **Desktop Commander** (`mcp__Desktop_Commander__*`) | `create_directory`, `start_process` für `pnpm init`, Git-Bootstrap |
| ADR-Doku | **Notion** (`mcp__2778793c__notion-*`) | `notion-create-database` "ADR Tracker", `notion-create-pages` pro ADR |
| Doku-Sync auf GDrive | **Google Drive** | `create_file` mit jeweiligem ADR-Markdown, organisiert in `/elbtronika/docs/adr/` |

### Phase 2 – Design System

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| Design Tokens aus Figma | **Figma** (`mcp__Figma__*`) | `get_variable_defs` aus deinem Brand-File, `get_design_context` für Komponenten-Specs |
| Screenshots für Storybook-Baseline | **Figma** | `get_screenshot` per Komponente |
| **UI-Generierung mit eigenem Token-Budget** | **Claude Design** (extern, claude.com/design) | Lou triggert manuell: "Generiere Component X im ELBTRONIKA-Brand". Ergebnis als Code in Repo committen. |
| Storybook-Doku | **Notion** | `notion-create-pages` für Component-Library-Übersicht |

### Phase 3 – Infrastruktur

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| Supabase Projekt | **Supabase** (`mcp__230328bd__*`) | `create_project` (EU-Frankfurt), `apply_migration` für Schemas, `execute_sql` für RLS-Policies, `list_projects` zum Verifizieren |
| Datenbank-Advisors | **Supabase** | `get_advisors` für Performance-Hinweise, `list_extensions` zum pgvector-Aktivieren |
| Sanity Setup | manuell + **Notion** | Sanity hat kein MCP-Tool im aktuellen Set; Lou setzt manuell auf, `notion-create-pages` für Setup-Doku |
| Netlify Projekt | **Netlify** (`mcp__d406f111__*`) | `netlify-project-services-reader/updater` zum Site-Anlegen, `get-netlify-coding-context` für Best-Practices |
| Cloudflare R2 | manuell | Cloudflare hat hier kein direktes MCP, via Web-Dashboard + Wrangler CLI lokal |
| Architektur-Diagramm | **Coda-like** (`mcp__b04fab3e__diagram_create`) | System-Diagramm der Cloud-Komponenten als Source-of-Truth |

### Phase 4 – Auth & Roles

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| RLS-Policies definieren | **Supabase** | `execute_sql` für policy-creation, dann `get_advisors` Security-Lint |
| Test-User seedeen | **Supabase** | `execute_sql` mit `INSERT` in `auth.users` (Test-Daten markiert) |
| Auth-Flow Doku | **Notion** + **GDrive** | Mermaid-Diagramm in Notion-Page, Backup auf Drive |

### Phase 5 – Content Model & CMS

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| Content-Schemas | **Supabase** | `apply_migration` für Mirror-Tabellen |
| Asset-Pipeline-Doku | **Notion** | Schemas + Upload-Flow als Notion-Page |
| Künstler-Onboarding-Mails | **Gmail** | Vorlagen pro Künstler vorbereiten |
| Pipeline-Tracking | **Airtable** | Status-Spalten: `eingeladen`, `vertrag_gesendet`, `unterschrieben`, `assets_geliefert`, `live` |

### Phase 6 – Classic Mode (Shop)

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| Real-Daten testen | **Supabase** | `execute_sql` für Artwork-Queries, Performance-Profiling |
| SEO-Vorschau | **Apify** | OG-Image und Meta-Tags per Crawl prüfen |
| Visual Reference | **Figma** | Mockups für Shop-Layout abrufen |

### Phase 7 – Immersive 3D Gallery

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| 3D-Asset-Validierung | **Desktop Commander** | `get_file_info` auf GLB/KTX2 vor Upload zu R2 |
| Performance-Logging | **Supabase** | `get_logs` Edge-Function-Performance |
| Raum-Layout | **Figma** | Top-Down-Plan der Rooms aus Figma extrahieren |
| 3D-Recherche-Beispiele | **Apify** | Showcase-Sites scrapen (z.B. Three.js Journey, Awwwards Winners 2026) |

### Phase 8 – Spatial Audio

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| Voice-Snippets generieren (optional) | **ElevenLabs** (`mcp__ElevenLabs_Agents_MCP_App__*`) | `search_voices` für ambient Voice-Tags pro Raum, falls künstlerisch gewünscht |
| HLS-Test-Streams | **Desktop Commander** | FFmpeg lokal starten (`start_process`) für eigenen HLS-Output |

### Phase 9 – Mode Transitions

(Keine direkten MCP-Connectors – primär Frontend-Code. Visual Regression über Playwright lokal.)

### Phase 10 – Stripe Connect & Checkout

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| Stripe-Setup verifizieren | **Stripe** (`mcp__a465fe2f__*`) | `get_stripe_account_info`, `retrieve_balance` |
| Test-Customer + Connected Account | **Stripe** | `create_customer`, `stripe_api_execute` für Account-Creation |
| Test-Produkt + Preis | **Stripe** | `create_product`, `create_price` |
| Test-Payment | **Stripe** | `create_payment_link` mit Test-Mode-Schlüssel |
| Webhook-Trail | **Stripe** | `list_payment_intents` zum Audit der Test-Transactions |
| Stripe-Best-Practice-Lookup | **Stripe** | `search_stripe_documentation`, `stripe_integration_recommender` |
| Gebührenstruktur dokumentieren | **Notion** | Tabellarisch mit Berechnungs-Formeln |
| Disputes-Handling | **Stripe** | `list_disputes`, `update_dispute` |

### Phase 11 – AI-Kuration (Claude)

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| Prompt-Library | **Notion** | Database mit allen System-Prompts, versioniert |
| Audit-Log Monitoring | **Supabase** | `execute_sql` Queries auf `ai_decisions`-Tabelle |
| Voice-Avatar (optional v2) | **ElevenLabs** | Audio-Stories als Voice-Track für Artwork-Beschreibungen |

### Phase 12 – Edge & Performance

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| Netlify Edge-Funktionen | **Netlify** | `netlify-deploy-services-reader` für Deploy-Status, `netlify-extension-services-updater` für Edge-Function-Config |
| Performance-Baseline | **Apify** | Lighthouse via Actor automatisiert |
| Architektur-Diagramm Update | **Coda-like** | Updated Edge-Topologie |

### Phase 13 – Compliance & Security

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| Privacy Impact Assessment | **GDrive** + **Notion** | Vorlage in GDrive, Kollaboration in Notion |
| Vertrags-PDF (DPA mit Stripe etc.) | **PDF Tools** | `extract_to_csv` für strukturierte Verarbeiter-Liste, `merge_pdfs` für Compliance-Dossier |
| RLS-Audit | **Supabase** | `get_advisors` Security-Lint |
| Audit-Log-Verifikation | **Supabase** | `execute_sql` auf `audit_events` |

### Phase 14 – Testing & QA

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| Test-Daten-Seeds | **Supabase** | `execute_sql` für deterministische Seeds |
| Coverage-Report | **GDrive** | Wöchentlicher Upload als Snapshot |

### Phase 15 – Launch

| Aufgabe | Connector | Konkrete Aktionen |
|---|---|---|
| Production-Deploy | **Netlify** | `netlify-deploy-services-updater` mit Production-Context |
| Go-Live-Communication | **Gmail** | Künstler/DJ benachrichtigen |
| Launch-Event-Calendar | **Google Calendar** | Marketing-Push planen |
| Stripe Live-Mode aktivieren | **Stripe** | `get_stripe_account_info` Live-Verifikation |
| Post-Launch Tracker | **Airtable** | Issue-Board für die ersten 14 Tage |

---

## 7. Claude Design – Externer Workflow

> **Wichtig:** Claude Design (claude.com/design) hat sein eigenes Token-Budget und ist von hier aus nicht direkt aufrufbar. Du triggerst es manuell aus dem Plan heraus.

### 7.1 Wann nutzen
- Phase 2 (Design System): Komponenten-Designs generieren oder verfeinern.
- Phase 6 (Shop UI): Mockups für Filter, Cards, Detail-Views.
- Phase 9 (Transition): Visualisierung des Mode-Switching für Stakeholder.
- Phase 11 (KI-UI): Empfehlungs-Cards, "Why?"-Tooltip-Designs.

### 7.2 Workflow
1. **Spec vorbereiten** in der Sonnet-Session: Komponenten-Name, Props, Use-Case, Brand-Tokens.
2. **Claude Design öffnen** (claude.com/design) im Browser.
3. **Brand-Kontext einfügen**: "ELBTRONIKA – dunkel, club-inspiriert, neon-akzente, minimalistisch. Tailwind v4. Tokens: ..."
4. **Komponente generieren**, iterieren bis zufrieden.
5. **Code zurück in Repo**: Datei in `packages/ui/components/` ablegen, manuell oder via Cowork-File-Drop.
6. **Sonnet-Session benachrichtigen**: "Component X generiert, bitte in Storybook + Tests integrieren."

### 7.3 Token-Sparpotenzial
- Visuelle Iteration läuft im Claude-Design-Budget, nicht im Sonnet-Chat.
- Sonnet bekommt nur fertigen Code zur Integration → leichtere Token-Last.

### 7.4 Output-Standard
Claude Design liefert React-Komponenten mit Tailwind. Vor dem Mergen prüfen:
- Tailwind v4 Syntax (CSS-Variablen statt JS-Config-Token-Aufrufe).
- Accessibility-Attribute (aria-*, role) vorhanden.
- Keine externen Image-URLs (alles via R2 oder Supabase Storage).
- Keine `localStorage`-Nutzung (Claude Design weiß das nicht immer).

---

## 8. Sonnet-Handover-Workflow

Damit du den Plan in einer neuen Sonnet-Session ausführen kannst, ohne unsere komplette Vorgeschichte mitzuschleppen.

### 8.1 Konzept
- **Diese Session (Opus):** Strategie, Plan, Architektur-Entscheidungen.
- **Sonnet-Sessions (eine pro Phase):** taktische Ausführung mit konkreten Code-Edits, Tests, Doku.
- Jede Sonnet-Session bekommt: (1) den Initial-Prompt aus Sektion 8.3, (2) Verweis auf den Plan, (3) den Phasen-Block, der ausgeführt werden soll.

### 8.2 Sonnet-Constraints
Sonnet ist schneller und billiger, aber benötigt:
- **klar abgegrenzte Aufgaben** (eine Phase oder ein Schritt, nicht "der ganze Plan").
- **explizite Tool-Verfügbarkeit** (welche MCPs darf es nutzen?).
- **Self-Contained Kontext** (alles, was es zur Ausführung braucht, im ersten Prompt oder im Plan-File).
- **Verifikation am Ende** (DoD-Checkliste explizit).

### 8.3 Initial-Prompt für Sonnet
Dieser ist als eigenes File abgelegt: `ELBTRONIKA_Sonnet_Handover_Prompt.md`. Du kopierst ihn in den neuen Chat, ergänzt die Phase und legst los.

### 8.4 Phase-Sub-Plan-Regel
Bevor Sonnet eine Phase startet, lass es einen **Phase-Sub-Plan** schreiben:
- Liest die Phase im v1.1-Plan.
- Listet alle Schritte als TodoWrite.
- Listet die nötigen MCP-Connectors aus Sektion 6.
- Bittet um Freigabe (kein Code, bevor freigegeben).

Erst nach Freigabe wird ausgeführt. Das spart Token und verhindert Drift.

### 8.5 Rückkanal in diese Opus-Session
Wenn Sonnet auf eine architektonische Frage stößt, die nicht im Plan steht:
- Sonnet stoppt, fragt explizit ("Frage X: ...").
- Du nimmst die Frage in die Opus-Session zurück, klärst sie strategisch.
- Plan-Update in v1.2.
- Sonnet bekommt das Update.

---

## 9. Aktualisierte Roadmap-Übersicht

```
WOCHE  PHASE                         PARALLEL?  KRITISCH?
1-2    Phase 0  Rechtliches          ja         🔴 (KYC blockiert)
2      Phase 1  Repo & Tooling       ja
3      Phase 2  Design System        ja
3-4    Phase 3  Infrastruktur        ja         🔴 (blockiert 4-7)
4      Phase 4  Auth                 nein
5      Phase 5  Content Model        nein
6-7    Phase 6  Classic Mode         nein
8-11   Phase 7  Immersive Mode       nein       🔴 (Single Canvas Foundation)
11-13  Phase 8  Spatial Audio        nein
13-14  Phase 9  Mode Transitions     nein
14-16  Phase 10 Stripe & Checkout    nein       🔴 (Live-Mode-Trigger)
16-17  Phase 11 AI-Kuration          ja
17-18  Phase 12 Edge & Performance   ja
18-19  Phase 13 Compliance Konsolid. nein       🔴 (Pre-Launch-Gate)
19-20  Phase 14 Testing              ja
20-22  Phase 15 Launch               nein       🔴 (Final Gate)
```

Realistische Solo-Schätzung: **20–24 Wochen bis Public Launch**, vorausgesetzt Phase 0 läuft sauber + KYC keine Verzögerung.

---

## 10. Top-Aktionen ab heute (25.04.2026)

Damit du sofort loslegen kannst:

1. **Heute / Morgen:**
   - UG-Gründung anstoßen (Online-Notar wählen).
   - Stripe-Account beantragen (KYC-Dokumente vorbereiten: Personalausweis, Adressnachweis, Bank).
   - Domains sichern: `elbtronika.de`, `elbtronika.com`, `elbtronika.art` über Cloudflare Registrar.
   - Anwalt IT-Recht kontaktieren: Termin in 1–2 Wochen.

2. **Diese Woche:**
   - Künstler-Verträge entwerfen lassen (Anwalt) → Templates in GDrive.
   - GitHub Organisation `elbtronika` anlegen.
   - Doppler-Account, alle Service-Accounts in zentraler 1Password/Bitwarden Vault.
   - Notion-Workspace „ELBTRONIKA" mit Sektionen: ADR, Pipeline, Compliance, Retros.

3. **Sobald Sonnet-Session startbar:**
   - Sonnet-Handover-Prompt kopieren in neuen Chat.
   - Erste Phase = Phase 1 (Repo-Setup) – schnelles Feedback, niedriges Risiko.
   - Nach Phase 1 grün: Phase 2 (Design System) parallel zu Phase 0 (rechtlich).

---

## 11. Risiko-Register (v1.1)

| Risiko | Wahrscheinlichkeit | Impact | Mitigation |
|---|---|---|---|
| Stripe KYC Verzögerung | mittel | hoch | parallel Mangopay als Fallback evaluieren (Phase 10 Plan B) |
| WebGPU-Browser-Inkompatibilität | niedrig | hoch | WebGL2-Fallback ab Tag 1 mitgebaut (Research bestätigt) |
| Künstler springt vor Launch ab | mittel | mittel | Min. 5 Künstler unter Vertrag bevor Launch, Buffer von 2 |
| GEMA-Forderung gegen DJ-Sets | mittel | hoch | Anwalt prüft DJ-Verträge auf Werkrechte / Sample-Clearance |
| Mobile FPS-Einbruch im Immersive | hoch | mittel | Quality-Settings + automatischer Fallback auf "Lite Mode" |
| DSGVO-Beschwerde wegen Spatial-Tracking | niedrig | hoch | Strikte Opt-in-Logik in Phase 13.1 + DPIA dokumentiert |
| Solo-Burnout | mittel | hoch | Realistische Phasen-Cuts, jedes Wochenende mind. 1 Tag offline |

---

## 12. Dokumenten-Versionierung

| Version | Datum | Änderung | Autor |
|---|---|---|---|
| v1.0 | 2026-04-24 | Initial Plan basierend auf Research-Dossier | Claude (Opus) + Lou |
| v1.1 | 2026-04-25 | Lou's Antworten eingearbeitet, MCP-Connector-Map, Claude Design Workflow, Sonnet-Handover | Claude (Opus) + Lou |

> **Empfehlung:** Beide Files (`v1.0` und `v1.1`) im Git committen, sobald Repo steht. v1.1 ist die aktive Arbeitsversion, v1.0 der Audit-Trail.
