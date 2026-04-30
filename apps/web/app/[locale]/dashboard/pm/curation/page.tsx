"use client";

import { useState } from "react";

interface MatchResult {
  artworkId: string;
  title: string;
  artist: string;
  similarityScore: number;
  matchReason: string;
  featureBreakdown: {
    mood: number;
    energy: number;
    color: number;
    composition: number;
  };
}

export default function PMCurationPage() {
  const [setId, setSetId] = useState("");
  const [limit, setLimit] = useState(5);
  const [loading, setLoading] = useState(false);
  const [matches, setMatches] = useState<MatchResult[]>([]);
  const [error, setError] = useState("");

  async function runMatching(e: React.FormEvent) {
    e.preventDefault();
    if (!setId.trim()) return;
    setLoading(true);
    setError("");
    setMatches([]);

    try {
      const res = await fetch("/api/flow/match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId, limit, diversify: true }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Matching failed");
      } else {
        setMatches(data.matches ?? []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function analyzeSet() {
    if (!setId.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/flow/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Analysis failed");
      } else {
        alert(`Analyse abgeschlossen! BPM: ${data.analysis.bpm}, Key: ${data.analysis.key}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Curation</h1>
        <p className="text-neutral-400">Music-Art Matching — Verbinde DJ-Sets mit Kunstwerken</p>
      </header>

      <form onSubmit={runMatching} className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h2 className="text-lg font-semibold mb-4">Matching starten</h2>
        <div className="flex gap-4 flex-wrap items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-xs text-neutral-400 mb-1">Set ID</label>
            <input
              type="text"
              value={setId}
              onChange={(e) => setSetId(e.target.value)}
              placeholder="UUID des DJ-Sets"
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="block text-xs text-neutral-400 mb-1">Limit</label>
            <input
              type="number"
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              min={1}
              max={20}
              className="w-20 rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm focus:outline-none focus:border-purple-500"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !setId.trim()}
            className="rounded-lg bg-purple-600 px-6 py-2 text-sm font-medium hover:bg-purple-500 disabled:opacity-50 transition-colors"
          >
            {loading ? "Läuft..." : "Matchen"}
          </button>
          <button
            type="button"
            onClick={analyzeSet}
            disabled={loading || !setId.trim()}
            className="rounded-lg bg-neutral-700 px-6 py-2 text-sm font-medium hover:bg-neutral-600 disabled:opacity-50 transition-colors"
          >
            Analysieren
          </button>
        </div>
        {error && <p className="text-red-400 text-sm mt-3">{error}</p>}
      </form>

      {/* Results */}
      {matches.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Ergebnisse ({matches.length})</h2>
          {matches.map((match, i) => (
            <div
              key={match.artworkId}
              className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-bold text-purple-400">#{i + 1}</span>
                    <h3 className="text-base font-semibold">{match.title}</h3>
                  </div>
                  <p className="text-sm text-neutral-400">{match.artist}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-400">
                    {Math.round(match.similarityScore * 100)}%
                  </div>
                  <div className="text-xs text-neutral-500">Match-Score</div>
                </div>
              </div>

              <p className="text-sm text-neutral-300 mb-3">{match.matchReason}</p>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "Mood", value: match.featureBreakdown.mood },
                  { label: "Energy", value: match.featureBreakdown.energy },
                  { label: "Color", value: match.featureBreakdown.color },
                  { label: "Comp", value: match.featureBreakdown.composition },
                ].map((f) => (
                  <div key={f.label} className="rounded bg-neutral-800/50 p-2 text-center">
                    <div className="text-sm font-medium">{Math.round(f.value * 100)}%</div>
                    <div className="text-[10px] text-neutral-500 uppercase">{f.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
