/**
 * Report Generator — Creates HTML reports with charts and tables.
 */

import type { BenchmarkReport } from "./runner";

export function generateHTMLReport(report: BenchmarkReport): string {
  const { summary, runs } = report;

  // Build improvement data for chart
  const improvementData = summary.improvementByRun.map((r) => ({
    run: r.run,
    successRate: Math.round(r.avgSuccessRate * 100),
    timeMs: Math.round(r.avgTimeMs),
  }));

  const taskTrends = summary.improvementByTask.map((t) => ({
    id: t.taskId.replace("task-", ""),
    run1: Math.round(t.run1 * 100),
    run2: Math.round(t.run2 * 100),
    run3: Math.round(t.run3 * 100),
    trend: t.trend,
    trendIcon: t.trend === "improving" ? "📈" : t.trend === "degrading" ? "📉" : "➡️",
  }));

  const skillEvolution = new Map<string, number[]>();
  for (const run of runs) {
    for (const skill of run.skillsUsed) {
      if (!skillEvolution.has(skill)) {
        skillEvolution.set(skill, [0, 0, 0]);
      }
      const arr = skillEvolution.get(skill)!;
      arr[run.runNumber - 1] = (arr[run.runNumber - 1] ?? 0) + 1;
    }
  }

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Hermes Agent Benchmark Report</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0a0b;
      color: #e5e5e5;
      line-height: 1.6;
      padding: 2rem;
    }
    h1 { font-size: 2rem; margin-bottom: 0.5rem; color: #fff; }
    h2 { font-size: 1.5rem; margin: 2rem 0 1rem; color: #a78bfa; }
    .subtitle { color: #888; margin-bottom: 2rem; }
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      background: #1a1a1b;
      border: 1px solid #2a2a2b;
      border-radius: 12px;
      padding: 1.5rem;
      text-align: center;
    }
    .stat-value {
      font-size: 2.5rem;
      font-weight: 700;
      color: #a78bfa;
    }
    .stat-label {
      font-size: 0.875rem;
      color: #888;
      margin-top: 0.25rem;
    }
    .chart-container {
      background: #1a1a1b;
      border: 1px solid #2a2a2b;
      border-radius: 12px;
      padding: 1.5rem;
      margin-bottom: 2rem;
      max-width: 900px;
    }
    .chart-row {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      background: #1a1a1b;
      border-radius: 12px;
      overflow: hidden;
      border: 1px solid #2a2a2b;
    }
    th, td {
      padding: 0.75rem 1rem;
      text-align: left;
      border-bottom: 1px solid #2a2a2b;
    }
    th {
      background: #1f1f20;
      font-weight: 600;
      color: #a78bfa;
      font-size: 0.875rem;
      text-transform: uppercase;
    }
    td { font-size: 0.875rem; }
    tr:hover { background: #1f1f20; }
    .trend-up { color: #4ade80; }
    .trend-down { color: #f87171; }
    .trend-stable { color: #fbbf24; }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .badge-easy { background: #065f46; color: #6ee7b7; }
    .badge-medium { background: #78350f; color: #fdba74; }
    .badge-hard { background: #7f1d1d; color: #fca5a5; }
    .badge-completed { background: #065f46; color: #6ee7b7; }
    .badge-failed { background: #7f1d1d; color: #fca5a5; }
    .badge-partial { background: #78350f; color: #fdba74; }
    footer {
      margin-top: 3rem;
      padding-top: 2rem;
      border-top: 1px solid #2a2a2b;
      color: #666;
      font-size: 0.875rem;
    }
  </style>
</head>
<body>
  <h1>🤖 Hermes Agent Benchmark Report</h1>
  <p class="subtitle">ELBTRONIKA AI Agent Evaluation — ${new Date().toLocaleDateString("de-DE")}</p>

  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-value">${summary.totalTasks}</div>
      <div class="stat-label">Tasks</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${summary.totalRuns}</div>
      <div class="stat-label">Total Runs</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${Math.round(summary.overallSuccessRate * 100)}%</div>
      <div class="stat-label">Success Rate</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${Math.round(summary.averageExecutionTimeMs)}ms</div>
      <div class="stat-label">Avg. Time</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${summary.skillsLearnedTotal}</div>
      <div class="stat-label">Skills Learned</div>
    </div>
  </div>

  <h2>📊 Improvement Over Iterations</h2>
  <div class="chart-row">
    <div class="chart-container">
      <canvas id="successChart" height="250"></canvas>
    </div>
    <div class="chart-container">
      <canvas id="timeChart" height="250"></canvas>
    </div>
  </div>

  <h2>📈 Task-by-Task Improvement</h2>
  <div class="chart-container">
    <canvas id="taskChart" height="300"></canvas>
  </div>

  <h2>📋 Detailed Results</h2>
  <table>
    <thead>
      <tr>
        <th>Task</th>
        <th>Type</th>
        <th>Difficulty</th>
        <th>Run 1</th>
        <th>Run 2</th>
        <th>Run 3</th>
        <th>Trend</th>
        <th>Skills Used</th>
      </tr>
    </thead>
    <tbody>
      ${taskTrends.map((t) => {
        const run = runs.find((r) => r.taskId.replace("task-", "") === t.id && r.runNumber === 1);
        const skills = run?.skillsUsed?.join(", ") ?? "—";
        const diffClass = run?.difficulty === "easy" ? "badge-easy" : run?.difficulty === "medium" ? "badge-medium" : "badge-hard";
        return `<tr>
          <td><strong>${t.id}</strong></td>
          <td>${run?.taskType ?? "—"}</td>
          <td><span class="badge ${diffClass}">${run?.difficulty ?? "—"}</span></td>
          <td>${t.run1}%</td>
          <td>${t.run2}%</td>
          <td>${t.run3}%</td>
          <td class="trend-${t.trend === 'improving' ? 'up' : t.trend === 'degrading' ? 'down' : 'stable'}">${t.trendIcon} ${t.trend}</td>
          <td>${skills}</td>
        </tr>`;
      }).join("")}
    </tbody>
  </table>

  <h2>🧠 Skill Evolution</h2>
  <div class="chart-container">
    <canvas id="skillChart" height="250"></canvas>
  </div>

  <footer>
    Generated by Hermes Agent Benchmark Runner — ELBTRONIKA ${new Date().getFullYear()}
  </footer>

  <script>
    const successData = ${JSON.stringify(improvementData.map((d) => d.successRate))};
    const timeData = ${JSON.stringify(improvementData.map((d) => d.timeMs))};
    const taskLabels = ${JSON.stringify(taskTrends.map((t) => t.id))};
    const taskRun1 = ${JSON.stringify(taskTrends.map((t) => t.run1))};
    const taskRun2 = ${JSON.stringify(taskTrends.map((t) => t.run2))};
    const taskRun3 = ${JSON.stringify(taskTrends.map((t) => t.run3))};
    const skillLabels = ${JSON.stringify(Array.from(skillEvolution.keys()))};
    const skillData = ${JSON.stringify(Array.from(skillEvolution.values()).map((arr) => arr.reduce((a, b) => a + b, 0)))};

    Chart.defaults.color = '#888';
    Chart.defaults.borderColor = '#2a2a2b';

    new Chart(document.getElementById('successChart'), {
      type: 'line',
      data: {
        labels: ['Run 1', 'Run 2', 'Run 3'],
        datasets: [{
          label: 'Avg Success Rate (%)',
          data: successData,
          borderColor: '#a78bfa',
          backgroundColor: 'rgba(167, 139, 250, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 6,
          pointBackgroundColor: '#a78bfa',
        }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Success Rate Improvement', color: '#fff' } },
        scales: { y: { min: 0, max: 100 } }
      }
    });

    new Chart(document.getElementById('timeChart'), {
      type: 'bar',
      data: {
        labels: ['Run 1', 'Run 2', 'Run 3'],
        datasets: [{
          label: 'Avg Execution Time (ms)',
          data: timeData,
          backgroundColor: ['#f87171', '#fbbf24', '#4ade80'],
          borderRadius: 6,
        }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Execution Time Trend', color: '#fff' } },
      }
    });

    new Chart(document.getElementById('taskChart'), {
      type: 'bar',
      data: {
        labels: taskLabels,
        datasets: [
          { label: 'Run 1', data: taskRun1, backgroundColor: '#f87171', borderRadius: 4 },
          { label: 'Run 2', data: taskRun2, backgroundColor: '#fbbf24', borderRadius: 4 },
          { label: 'Run 3', data: taskRun3, backgroundColor: '#4ade80', borderRadius: 4 },
        ]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Success Rate per Task (%)', color: '#fff' } },
        scales: { y: { min: 0, max: 100 } }
      }
    });

    new Chart(document.getElementById('skillChart'), {
      type: 'doughnut',
      data: {
        labels: skillLabels,
        datasets: [{
          data: skillData,
          backgroundColor: ['#a78bfa', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#c084fc'],
          borderWidth: 0,
        }]
      },
      options: {
        responsive: true,
        plugins: { title: { display: true, text: 'Skill Usage Distribution', color: '#fff' } },
      }
    });
  </script>
</body>
</html>`;
}

export function generateMarkdownTable(report: BenchmarkReport): string {
  const rows = report.summary.improvementByTask.map((t) => {
    const task = report.runs.find((r) => r.taskId === t.taskId && r.runNumber === 1);
    const run1 = Math.round(t.run1 * 100);
    const run2 = Math.round(t.run2 * 100);
    const run3 = Math.round(t.run3 * 100);
    const delta = run3 - run1;
    const deltaStr = delta > 0 ? `+${delta}%` : `${delta}%`;
    const trend = delta > 0 ? "📈" : delta < 0 ? "📉" : "➡️";
    return `| ${task?.taskId.replace("task-", "")} | ${task?.taskType} | ${task?.difficulty} | ${run1}% | ${run2}% | ${run3}% | ${trend} ${deltaStr} |`;
  }).join("\n");

  return `## Hermes Agent Benchmark Results

### Summary
- **Tasks**: ${report.summary.totalTasks}
- **Total Runs**: ${report.summary.totalRuns}
- **Overall Success Rate**: ${Math.round(report.summary.overallSuccessRate * 100)}%
- **Avg Execution Time**: ${Math.round(report.summary.averageExecutionTimeMs)}ms
- **Skills Learned**: ${report.summary.skillsLearnedTotal}

### Improvement by Task

| Task | Type | Difficulty | Run 1 | Run 2 | Run 3 | Trend |
|------|------|------------|-------|-------|-------|-------|
${rows}

### Improvement by Iteration

| Run | Avg Success Rate | Avg Time (ms) |
|-----|------------------|---------------|
${report.summary.improvementByRun.map((r) => `| ${r.run} | ${Math.round(r.avgSuccessRate * 100)}% | ${Math.round(r.avgTimeMs)} |`).join("\n")}

---
*Generated: ${new Date().toISOString()}*
`;
}
