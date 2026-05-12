/** 
 * Prompt loader for Copilot-style .md files.
 * Resolves ${input:varName:description} placeholders using test vars, so promptfoo can drive 
 * Copilot prompts without modification
 */
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const REPO_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../../plugins');

const PLACEHOLDER_REGEX = /\$\{input:(\w+)(:[^}]*)?\}/g;

export default function ({ vars }) {
  const promptFilePath = resolve(REPO_ROOT, vars.__promptFile);
  const replacePlaceholders = (str) =>
    str?.replaceAll(PLACEHOLDER_REGEX, (_, name) => vars[name] ?? `<${name}>`);

  // Replace ${input:varName:description?} with the corresponding var value
  const interpolatedPromptMessage = replacePlaceholders(readFileSync(promptFilePath, 'utf8'));
  const interpolatedUserMessage = vars.__userPrompt ? replacePlaceholders(vars.__userPrompt) : '';

  return interpolatedPromptMessage + `\n` + interpolatedUserMessage;
}