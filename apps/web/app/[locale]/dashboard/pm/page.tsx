/**
 * Project Management Hub
 * Central dashboard for agent tasks, curation, and analytics.
 */

import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Project Management | ELBTRONIKA",
  description: "AI-driven project management and curation hub",
};

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PMHubPage({ params }: Props) {
  const { locale } = await params;

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-8">
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Project Management</h1>
        <p className="text-neutral-400">
          Hermes Agent — KI-gesteuertes Projektmanagement & Kuratierung
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl">
        {/* Tasks Card */}
        <Link
          href={`/${locale}/dashboard/pm/tasks`}
          className="group block rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 hover:border-neutral-600 transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-blue-500/20 flex items-center justify-center text-blue-400 text-lg">
              🤖
            </div>
            <h2 className="text-lg font-semibold">Agent Tasks</h2>
          </div>
          <p className="text-sm text-neutral-400 mb-4">
            Erstelle und überwache Agent-Tasks für Kuratierung, Onboarding und Analyse.
          </p>
          <span className="text-sm text-blue-400 group-hover:underline">Tasks öffnen →</span>
        </Link>

        {/* Curation Card */}
        <Link
          href={`/${locale}/dashboard/pm/curation`}
          className="group block rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 hover:border-neutral-600 transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-purple-500/20 flex items-center justify-center text-purple-400 text-lg">
              🎨
            </div>
            <h2 className="text-lg font-semibold">Curation</h2>
          </div>
          <p className="text-sm text-neutral-400 mb-4">
            Music-Art Matching: Verbinde DJ-Sets mit passenden Kunstwerken.
          </p>
          <span className="text-sm text-purple-400 group-hover:underline">Kuratieren →</span>
        </Link>

        {/* MCP Tools Card */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-green-500/20 flex items-center justify-center text-green-400 text-lg">
              🔧
            </div>
            <h2 className="text-lg font-semibold">MCP Tools</h2>
          </div>
          <p className="text-sm text-neutral-400 mb-4">
            Verfügbare Tools: Supabase, Sanity, Stripe, Audio, Browser.
          </p>
          <a
            href="/api/mcp/tools"
            target="_blank"
            className="text-sm text-green-400 hover:underline"
            rel="noopener"
          >
            Tools anzeigen →
          </a>
        </div>

        {/* Monitoring Card */}
        <Link
          href="/dashboard/monitoring"
          className="group block rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 hover:border-neutral-600 transition-colors"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-lg bg-red-500/20 flex items-center justify-center text-red-400 text-lg">
              🔍
            </div>
            <h2 className="text-lg font-semibold">Monitoring</h2>
          </div>
          <p className="text-sm text-neutral-400 mb-4">
            System Health, Core Web Vitals, 48h Post-Deploy Checks.
          </p>
          <span className="text-sm text-red-400 group-hover:underline">Dashboard öffnen →</span>
        </Link>

        {/* Status Card */}
        <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 md:col-span-2 lg:col-span-3">
          <h2 className="text-lg font-semibold mb-4">Agent Status</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-lg bg-neutral-800/50 p-4">
              <div className="text-2xl font-bold text-blue-400">4</div>
              <div className="text-xs text-neutral-400">MCP Server</div>
            </div>
            <div className="rounded-lg bg-neutral-800/50 p-4">
              <div className="text-2xl font-bold text-purple-400">3</div>
              <div className="text-xs text-neutral-400">Memory Layers</div>
            </div>
            <div className="rounded-lg bg-neutral-800/50 p-4">
              <div className="text-2xl font-bold text-green-400">4</div>
              <div className="text-xs text-neutral-400">Built-in Skills</div>
            </div>
            <div className="rounded-lg bg-neutral-800/50 p-4">
              <div className="text-2xl font-bold text-orange-400">∞</div>
              <div className="text-xs text-neutral-400">Matching Engine</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
