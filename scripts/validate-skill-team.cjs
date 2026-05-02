#!/usr/bin/env node
/* Validate installed Codex skill-team harness integration. */

const fs = require("node:fs");
const path = require("node:path");
const childProcess = require("node:child_process");

const args = new Set(process.argv.slice(2));
const strictMemory = args.has("--strict-memory");
const strictRuntime = args.has("--strict-runtime");

const repoRoot = path.resolve(__dirname, "..");
const codexHome = process.env.CODEX_HOME || path.join(process.env.USERPROFILE || "", ".codex");
const skillsRoot = path.join(codexHome, "skills");

const failures = [];
const warnings = [];

const skills = [
  { dir: "browser-harness", name: "browser", command: "browser-harness" },
  { dir: "hermes-agent", name: "hermes-agent", command: "hermes" },
  { dir: "caveman", name: "caveman" },
  { dir: "obsidian", name: "obsidian" },
  { dir: "remotion-best-practices", name: "remotion-best-practices" },
];

const requiredFiles = [
  "engineering-harness/SKILL_TEAM_HARNESS.md",
  "engineering-harness/PRE_FLIGHT_PROTOCOL.md",
  "engineering-harness/ULTRAPLAN_AGENT_PREFLIGHT.md",
  "engineering-harness/COPILOT_AGENT_PREFLIGHT.md",
  "engineering-harness/CHEATSHEET.md",
  "engineering-harness/HARNESS.md",
  "memory/OPSIDIAN_MEMORY.md",
];

const requiredText = [
  {
    file: "engineering-harness/PRE_FLIGHT_PROTOCOL.md",
    text: "SKILL_TEAM_HARNESS.md",
    label: "skill-team cross-reference",
  },
  {
    file: "engineering-harness/ULTRAPLAN_AGENT_PREFLIGHT.md",
    text: "SKILL_TEAM_HARNESS.md",
    label: "ULTRAPLAN skill-team route",
  },
  {
    file: "engineering-harness/COPILOT_AGENT_PREFLIGHT.md",
    text: "SKILL_TEAM_HARNESS.md",
    label: "Copilot skill-team route",
  },
  {
    file: "engineering-harness/CHEATSHEET.md",
    text: "SKILL_TEAM_HARNESS.md",
    label: "cheatsheet skill-team reference",
  },
  {
    file: "engineering-harness/HARNESS.md",
    text: "SKILL_TEAM_HARNESS.md",
    label: "main harness skill-team reference",
  },
  {
    file: "memory/OPSIDIAN_MEMORY.md",
    text: "Skill-Team Harness",
    label: "memory skill-team entry",
  },
];

function existsFile(relativePath) {
  return fs.existsSync(path.join(repoRoot, relativePath));
}

function commandExists(command) {
  try {
    if (process.platform === "win32") {
      childProcess.execFileSync("where.exe", [command], { stdio: "ignore" });
    } else {
      childProcess.execFileSync("sh", ["-lc", `command -v ${JSON.stringify(command)}`], {
        stdio: "ignore",
      });
    }
    return true;
  } catch {
    return false;
  }
}

console.log("Skill-Team Harness validation");
console.log(`Repo: ${repoRoot}`);
console.log(`Skills: ${skillsRoot}`);
console.log("");

for (const skill of skills) {
  const skillMd = path.join(skillsRoot, skill.dir, "SKILL.md");
  if (!fs.existsSync(skillMd)) {
    failures.push(`Missing installed skill: ${skill.dir}`);
    continue;
  }

  const content = fs.readFileSync(skillMd, "utf8");
  const namePattern = new RegExp(`^name:\\s*${skill.name}\\s*$`, "m");
  if (!namePattern.test(content)) {
    failures.push(`Unexpected or missing skill metadata name for ${skill.dir}`);
  } else {
    console.log(`[OK] skill installed: ${skill.dir}`);
  }

  if (skill.command) {
    if (commandExists(skill.command)) {
      console.log(`[OK] runtime command on PATH: ${skill.command}`);
    } else {
      const message = `Runtime command not on PATH: ${skill.command}`;
      if (strictRuntime) failures.push(message);
      else warnings.push(message);
    }
  }
}

for (const file of requiredFiles) {
  if (existsFile(file)) {
    console.log(`[OK] harness file exists: ${file}`);
  } else {
    failures.push(`Missing harness file: ${file}`);
  }
}

for (const check of requiredText) {
  const fullPath = path.join(repoRoot, check.file);
  if (!fs.existsSync(fullPath)) {
    failures.push(`Missing file for text check: ${check.file}`);
    continue;
  }
  const content = fs.readFileSync(fullPath, "utf8");
  if (!content.includes(check.text)) {
    failures.push(`Missing '${check.label}' in ${check.file}`);
  }
}

if (existsFile("packages/browser/src/harness.ts")) {
  console.log("[OK] repo browser harness present");
} else {
  warnings.push("Repo browser harness package not found");
}

if (existsFile("apps/video/package.json")) {
  console.log("[OK] Remotion app package present");
} else {
  warnings.push("No Remotion app package yet; video tasks remain future-scaffold gated");
}

if (strictMemory) {
  const memoryIndex = path.join(repoRoot, "memory/OPSIDIAN_MEMORY.md");
  if (fs.existsSync(memoryIndex)) {
    const content = fs.readFileSync(memoryIndex, "utf8");
    const matches = new Set(content.match(/memory\/(?:handoffs|runs)\/[^`) ]+\.md/g) || []);
    for (const memoryPath of matches) {
      if (memoryPath.includes("<") || memoryPath.includes(">")) {
        continue;
      }
      if (!fs.existsSync(path.join(repoRoot, memoryPath))) {
        failures.push(`Missing memory path referenced from OPSIDIAN_MEMORY.md: ${memoryPath}`);
      }
    }
    console.log(`[OK] strict memory references scanned: ${matches.size}`);
  }
}

console.log("");
for (const warning of warnings) {
  console.log(`[WARN] ${warning}`);
}

if (failures.length > 0) {
  for (const failure of failures) {
    console.error(`[FAIL] ${failure}`);
  }
  process.exit(1);
}

console.log("Result: skill-team harness validation passed");
