"use client";

import { useState, useEffect, useCallback } from "react";

interface AgentTaskItem {
  id: string;
  type: string;
  status: string;
  goal: string;
  currentStep: number;
  totalSteps: number;
  createdAt: string;
  completedAt?: string;
}

export default function PMTasksPage() {
  const [tasks, setTasks] = useState<AgentTaskItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTask, setNewTask] = useState({ type: "curate", goal: "" });
  const [creating, setCreating] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const res = await fetch("/api/agent/task");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch tasks:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 5000);
    return () => clearInterval(interval);
  }, [fetchTasks]);

  async function createTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.goal.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/agent/task", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: newTask.type,
          goal: newTask.goal,
          execute: true,
        }),
      });
      if (res.ok) {
        setNewTask({ type: "curate", goal: "" });
        await fetchTasks();
      }
    } catch (err) {
      console.error("Failed to create task:", err);
    } finally {
      setCreating(false);
    }
  }

  const statusColors: Record<string, string> = {
    pending: "text-yellow-400 bg-yellow-400/10",
    running: "text-blue-400 bg-blue-400/10",
    completed: "text-green-400 bg-green-400/10",
    failed: "text-red-400 bg-red-400/10",
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b] text-white p-8">
      <header className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Agent Tasks</h1>
        <p className="text-neutral-400">Erstelle und überwache Hermes Agent Tasks</p>
      </header>

      {/* Create Task Form */}
      <form onSubmit={createTask} className="mb-8 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        <h2 className="text-lg font-semibold mb-4">Neuen Task erstellen</h2>
        <div className="flex gap-4 flex-wrap">
          <select
            value={newTask.type}
            onChange={(e) => setNewTask((t) => ({ ...t, type: e.target.value }))}
            className="rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          >
            <option value="curate">Curate</option>
            <option value="onboard">Onboard</option>
            <option value="test">Test</option>
            <option value="analyze">Analyze</option>
            <option value="research">Research</option>
            <option value="custom">Custom</option>
          </select>
          <input
            type="text"
            value={newTask.goal}
            onChange={(e) => setNewTask((t) => ({ ...t, goal: e.target.value }))}
            placeholder="Task-Ziel beschreiben..."
            className="flex-1 min-w-[200px] rounded-lg bg-neutral-800 border border-neutral-700 px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={creating || !newTask.goal.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-medium hover:bg-blue-500 disabled:opacity-50 transition-colors"
          >
            {creating ? "Startet..." : "Starten"}
          </button>
        </div>
      </form>

      {/* Tasks List */}
      {loading ? (
        <div className="text-neutral-400">Lade Tasks...</div>
      ) : tasks.length === 0 ? (
        <div className="text-neutral-500 text-center py-12">Keine Tasks vorhanden. Erstelle einen neuen Task oben.</div>
      ) : (
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 flex items-center justify-between gap-4"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColors[task.status] ?? "text-neutral-400 bg-neutral-400/10"}`}>
                    {task.status}
                  </span>
                  <span className="text-xs text-neutral-500 uppercase">{task.type}</span>
                </div>
                <p className="text-sm truncate">{task.goal}</p>
                <p className="text-xs text-neutral-500 mt-1">
                  Schritt {task.currentStep} / {task.totalSteps} • {new Date(task.createdAt).toLocaleString("de-DE")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
