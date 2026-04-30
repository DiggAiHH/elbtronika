import type { ReactNode } from "react";

export default function PMLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <nav className="border-b border-neutral-800 px-8 py-4">
        <div className="flex items-center gap-6 text-sm">
          <a href="/dashboard/pm" className="text-white font-medium hover:text-neutral-300 transition-colors">
            Übersicht
          </a>
          <a href="/dashboard/pm/tasks" className="text-neutral-400 hover:text-white transition-colors">
            Tasks
          </a>
          <a href="/dashboard/pm/curation" className="text-neutral-400 hover:text-white transition-colors">
            Curation
          </a>
        </div>
      </nav>
      <main>{children}</main>
    </div>
  );
}
