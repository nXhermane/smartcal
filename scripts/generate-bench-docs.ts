/**
 * @file scripts/generate-bench-docs.ts
 * @description Reads bench/results/current.json and generates markdown tables
 *              for the VitePress benchmarks page.
 *
 * Usage: bun run scripts/generate-bench-docs.ts
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface BenchmarkResult {
  id: string;
  name: string;
  rank: number;
  rme: number;
  hz: number;
  period: number;
  mean: number;
  median: number;
  min: number;
  max: number;
  p75: number;
  p99: number;
  sampleCount: number;
}

interface BenchmarkGroup {
  fullName: string;
  benchmarks: BenchmarkResult[];
}

interface BenchmarkFile {
  filepath: string;
  groups: BenchmarkGroup[];
}

interface BenchmarkOutput {
  files: BenchmarkFile[];
}

function formatHz(hz: number): string {
  if (hz >= 1_000_000) return `${(hz / 1_000_000).toFixed(1)}M ops/s`;
  if (hz >= 1_000) return `${(hz / 1_000).toFixed(1)}K ops/s`;
  return `${hz.toFixed(0)} ops/s`;
}

function formatLatency(periodMs: number): string {
  if (periodMs >= 1) return `${periodMs.toFixed(1)} ms`;
  if (periodMs >= 0.001) return `${(periodMs * 1000).toFixed(0)} µs`;
  return `${(periodMs * 1_000_000).toFixed(0)} ns`;
}

function getShortGroupName(fullName: string): string {
  const match = fullName.match(/>\s*(.+)$/);
  return match ? (match[1] as string).trim() : fullName;
}

function generateMarkdown(data: BenchmarkOutput): string {
  const lines: string[] = [];

  for (const file of data.files) {
    for (const group of file.groups) {
      const groupName = getShortGroupName(group.fullName);
      lines.push('');
      lines.push(`## ${groupName}`);
      lines.push('');
      lines.push('| Scenario | Throughput | Latency | Median |');
      lines.push('| :--- | :--- | :--- | :--- |');

      for (const bench of group.benchmarks) {
        lines.push(
          `| ${bench.name} | **${formatHz(bench.hz)}** | ${formatLatency(bench.period)} | ${formatLatency(bench.median)} |`
        );
      }

      lines.push('');
    }
  }

  return lines.join('\n');
}

// ── Main ────────────────────────────────────────────────────────────────────

const projectRoot = process.cwd();
const jsonPath = join(projectRoot, 'bench', 'results', 'current.json');

let data: BenchmarkOutput;
try {
  const raw = readFileSync(jsonPath, 'utf-8');
  data = JSON.parse(raw) as BenchmarkOutput;
} catch {
  console.error('Could not read bench/results/current.json. Run "bun run bench:save" first.');
  process.exit(1);
}

const markdown = generateMarkdown(data);

const outputPath = join(projectRoot, 'docs', 'internals', 'benchmarks.generated.md');
writeFileSync(outputPath, markdown, 'utf-8');

console.log(`Generated ${outputPath}`);
console.log(
  `${data.files.reduce((acc, f) => acc + f.groups.reduce((a, g) => a + g.benchmarks.length, 0), 0)} benchmarks from ${data.files.length} file(s)`,
);
