import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

interface CoverageDetail {
  covered: number;
  pct: number;
  skipped: number;
  total: number;
}

interface FileCoverage {
  branches: CoverageDetail;
  branchesTrue: CoverageDetail;
  functions: CoverageDetail;
  lines: CoverageDetail;
  statements: CoverageDetail;
}

type Coverage = {
  total: FileCoverage;
} & {
  [file: string]: FileCoverage;
};

const readmePath = join(__dirname, '..', 'README.md');
const readme = readFileSync(readmePath, 'utf8');

const coveragePath = join(__dirname, '..', 'coverage', 'coverage-summary.json');
const coverageSummary = JSON.parse(readFileSync(coveragePath, 'utf8')) as Coverage;
const coverage = Math.round(coverageSummary.total.lines.pct);

let color: 'brightgreen' | 'green' | 'yellow' | 'yellowgreen' | 'orange' | 'red' | 'blue' | 'grey' | 'lightgrey';
if (coverage > 98) {
  color = 'brightgreen';
} else if (coverage > 95) {
  color = 'green';
} else if (coverage > 90) {
  color = 'yellow';
} else if (coverage > 80) {
  color = 'yellowgreen';
} else if (coverage > 50) {
  color = 'orange';
} else {
  color = 'red';
}

const newReadme = readme.replace(/(!\[Coverage Badge\]\(https:\/\/img.shields.io\/badge\/coverage-)(\d+)(%25-)(\w+)(\?style=flat\))/, `$1${coverage}$3${color}$5`);
writeFileSync(readmePath, newReadme);
