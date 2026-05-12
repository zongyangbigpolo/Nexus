import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const warnings = [];
const errors = [];

function commandVersion(command, args = ['--version']) {
  const result = spawnSync(command, args, { encoding: 'utf8' });
  if (result.error) return null;
  if (result.status !== 0) return null;
  const output = `${result.stdout || ''}\n${result.stderr || ''}`.trim();
  const lines = output.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  return lines.find((line) => /^v?\d+\.\d+\.\d+/.test(line)) || lines[0] || null;
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

const nodeVersion = commandVersion('node', ['--version']);
if (nodeVersion) {
  console.log(`node: ${nodeVersion}`);
} else {
  errors.push('node is required for validation and eval provider smoke tests.');
}

const npmVersion = commandVersion('npm', ['--version']);
if (npmVersion) {
  console.log(`npm: ${npmVersion}`);
} else {
  warnings.push('npm was not found; eval provider dependency installation may fail.');
}

const promptfooVersion = commandVersion('promptfoo', ['--version']);
if (promptfooVersion) {
  console.log(`promptfoo: ${promptfooVersion}`);
} else {
  warnings.push('promptfoo is not installed globally. Install with: npm install -g promptfoo@latest');
}

if (!exists('eval/providers/node_modules')) {
  warnings.push('eval provider dependencies are not installed. Run: cd eval/providers && npm install');
}

for (const file of [
  '.github/plugin/marketplace.json',
  '.github/plugin/mcp.sample.json',
  'eval/providers/.env.example',
  'eval/providers/model-client.js'
]) {
  if (!exists(file)) {
    errors.push(`required runtime file is missing: ${file}`);
  }
}

const marketplace = JSON.parse(fs.readFileSync(path.join(root, '.github/plugin/marketplace.json'), 'utf8'));
console.log(`marketplace: ${marketplace.name} (${marketplace.plugins.length} plugins registered)`);

if (warnings.length > 0) {
  console.warn('\nRuntime warnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length > 0) {
  console.error('\nRuntime check failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('\nRuntime check passed.');
