#!/usr/bin/env node

/**
 * Hermes Agent Benchmark CLI
 *
 * Usage: npx tsx packages/agent/src/benchmark.ts [--iterations=3] [--report=./report.html]
 */

import { writeFileSync } from "node:fs";
import { generateHTMLReport, generateMarkdownTable } from "./report";
import { BenchmarkRunner } from "./runner";

async function main() {
  const iterations = Number(
    process.argv.find((a) => a.startsWith("--iterations="))?.split("=")[1] ?? 3,
  );
  const reportPath =
    process.argv.find((a) => a.startsWith("--report="))?.split("=")[1] ?? "./benchmark-report.html";
  const mdPath = reportPath.replace(".html", ".md");

  const runner = new BenchmarkRunner();
  const report = await runner.runBenchmark(iterations);

  const html = generateHTMLReport(report);
  const markdown = generateMarkdownTable(report);

  writeFileSync(reportPath, html);
  writeFileSync(mdPath, markdown);

  console.log(`\n${"=".repeat(60)}`);
  console.log("✅ Benchmark Complete!");
  console.log("=".repeat(60));
  console.log(`\n📄 HTML Report: ${reportPath}`);
  console.log(`📝 Markdown Table: ${mdPath}`);
  console.log(`\n📊 Summary:`);
  console.log(`   • Overall Success Rate: ${Math.round(report.summary.overallSuccessRate * 100)}%`);
  console.log(`   • Average Time: ${Math.round(report.summary.averageExecutionTimeMs)}ms`);
  console.log(`   • Skills Learned: ${report.summary.skillsLearnedTotal}`);
  console.log(
    `   • Tasks: ${report.summary.totalTasks} × ${iterations} iterations = ${report.summary.totalRuns} runs`,
  );

  // Print markdown to stdout too
  console.log(`\n${markdown}`);
}

main().catch((err) => {
  console.error("❌ Benchmark failed:", err);
  process.exit(1);
});
