"use client";

import { useEffect, useState } from "react";

interface HealthCheck {
  name: string;
  status: "ok" | "fail" | "unknown";
  latency?: number;
  lastChecked?: string;
}

interface MonitoringData {
  health: HealthCheck[];
  vitals: {
    lcp: number;
    fid: number;
    cls: number;
    inp: number;
  };
  deploy: {
    version: string;
    deployedAt: string;
    commit: string;
  };
}

export default function MonitoringDashboard() {
  const [data, setData] = useState<MonitoringData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchHealth() {
      try {
        const res = await fetch("/api/health", { cache: "no-store" });
        const healthJson = await res.json();

        const checks: HealthCheck[] = [
          {
            name: "Application",
            status: healthJson.status === "ok" ? "ok" : "fail",
            lastChecked: healthJson.timestamp,
          },
          {
            name: "Supabase",
            status: healthJson.checks?.supabase ?? "unknown",
            lastChecked: healthJson.timestamp,
          },
          {
            name: "Sanity",
            status: healthJson.checks?.sanity ?? "unknown",
            lastChecked: healthJson.timestamp,
          },
        ];

        setData({
          health: checks,
          vitals: { lcp: 0, fid: 0, cls: 0, inp: 0 },
          deploy: {
            version: healthJson.version ?? "unknown",
            deployedAt: healthJson.timestamp,
            commit: "—",
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Health check failed");
      } finally {
        setLoading(false);
      }
    }

    fetchHealth();
    const interval = setInterval(fetchHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">🔍 Monitoring Dashboard</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-32 bg-neutral-900 rounded-xl" />
            <div className="h-48 bg-neutral-900 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">🔍 Monitoring Dashboard</h1>
          <div className="bg-red-900/20 border border-red-800 rounded-xl p-6">
            <p className="text-red-400">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 p-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">🔍 Monitoring Dashboard</h1>
            <p className="text-neutral-400 mt-1">Real-time system health and performance metrics</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-neutral-400">Version</div>
            <div className="font-mono text-lg">{data?.deploy.version}</div>
          </div>
        </header>

        {/* Health Cards */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-violet-400">System Health</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {data?.health.map((check) => (
              <div
                key={check.name}
                className={`rounded-xl border p-6 ${
                  check.status === "ok"
                    ? "bg-emerald-950/30 border-emerald-800"
                    : check.status === "fail"
                      ? "bg-red-950/30 border-red-800"
                      : "bg-amber-950/30 border-amber-800"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{check.name}</span>
                  <StatusBadge status={check.status} />
                </div>
                <div className="text-sm text-neutral-400">
                  {check.lastChecked
                    ? new Date(check.lastChecked).toLocaleTimeString("de-DE")
                    : "—"}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Core Web Vitals */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-violet-400">Core Web Vitals (RUM)</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <VitalCard name="LCP" value={data?.vitals.lcp ?? 0} unit="ms" target={2500} />
            <VitalCard name="FID" value={data?.vitals.fid ?? 0} unit="ms" target={100} />
            <VitalCard name="CLS" value={data?.vitals.cls ?? 0} unit="" target={0.1} />
            <VitalCard name="INP" value={data?.vitals.inp ?? 0} unit="ms" target={200} />
          </div>
        </section>

        {/* 48h Monitoring Checklist */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-violet-400">48h Post-Deploy Checklist</h2>
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
            <div className="space-y-3">
              {[
                { label: "Hour 1 — Health check + CWV baseline", done: true },
                { label: "Hour 6 — Error rate review", done: false },
                { label: "Hour 12 — Traffic pattern analysis", done: false },
                { label: "Hour 24 — Daily summary + Lighthouse", done: false },
                { label: "Hour 36 — Mid-phase health check", done: false },
                { label: "Hour 48 — Final report + sign-off", done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div
                    className={`w-5 h-5 rounded flex items-center justify-center text-xs ${
                      item.done ? "bg-emerald-600 text-white" : "bg-neutral-700 text-neutral-400"
                    }`}
                  >
                    {item.done ? "✓" : "○"}
                  </div>
                  <span
                    className={item.done ? "text-neutral-300 line-through" : "text-neutral-100"}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-xl font-semibold mb-4 text-violet-400">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <ActionButton href="/api/health" label="Health Check" />
            <ActionButton href="/dashboard/pm" label="PM Dashboard" />
            <ActionButton href="/dashboard/pm/tasks" label="Agent Tasks" />
            <ActionButton href="/dashboard/pm/curation" label="Curation" />
          </div>
        </section>

        <footer className="text-sm text-neutral-500 pt-8 border-t border-neutral-800">
          <p>ELBTRONIKA Monitoring — Last updated: {new Date().toLocaleString("de-DE")}</p>
        </footer>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors = {
    ok: "bg-emerald-600/20 text-emerald-400 border-emerald-700",
    fail: "bg-red-600/20 text-red-400 border-red-700",
    unknown: "bg-amber-600/20 text-amber-400 border-amber-700",
  };
  return (
    <span
      className={`px-2 py-0.5 rounded text-xs font-medium border ${colors[status as keyof typeof colors] ?? colors.unknown}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

function VitalCard({
  name,
  value,
  unit,
  target,
}: {
  name: string;
  value: number;
  unit: string;
  target: number;
}) {
  const ok = value <= target && value > 0;
  const na = value === 0;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4">
      <div className="text-sm text-neutral-400 mb-1">{name}</div>
      <div
        className={`text-2xl font-bold ${na ? "text-neutral-500" : ok ? "text-emerald-400" : "text-red-400"}`}
      >
        {na ? "—" : `${value}${unit}`}
      </div>
      <div className="text-xs text-neutral-500 mt-1">
        Target: ≤ {target}
        {unit}
      </div>
    </div>
  );
}

function ActionButton({ href, label }: { href: string; label: string }) {
  return (
    <a
      href={href}
      className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 border border-neutral-700 rounded-lg text-sm transition-colors"
    >
      {label}
    </a>
  );
}
