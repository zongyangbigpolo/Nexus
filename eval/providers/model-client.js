// Copyright © 2026. Organization Systems, Inc. All Rights Reserved. Confidential & Proprietary.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import OpenAI from 'openai';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DOTENV_PATH = path.join(__dirname, '.env');

loadDotEnv(DOTENV_PATH);

function loadDotEnv(filePath) {
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const rawValue = trimmed.slice(separatorIndex + 1).trim();
    const value = rawValue.replaceAll(/^['"]|['"]$/g, '');

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function firstDefined(...values) {
  return values.find((value) => value !== undefined && value !== '');
}

function providerDefaults(provider) {
  switch (provider) {
    case 'deepseek':
      return { model: 'deepseek-chat', baseURL: 'https://api.deepseek.com' };
    case 'openrouter':
      return { model: 'openai/gpt-4o-mini', baseURL: 'https://openrouter.ai/api/v1' };
    case 'gemini':
      return { model: 'gemini-2.0-flash', baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/' };
    case 'ollama':
      return { model: 'llama3.1', baseURL: 'http://localhost:11434/v1', apiKey: 'ollama' };
    default:
      return { model: 'gpt-4o' };
  }
}

function resolveModelConfig(role = 'agent') {
  const prefix = role === 'grader' ? 'GRADER_' : 'EVAL_';
  const provider = firstDefined(process.env[`${prefix}PROVIDER`], process.env.EVAL_PROVIDER, inferProvider());
  const defaults = providerDefaults(provider);
  const model = firstDefined(process.env[`${prefix}MODEL`], process.env.EVAL_MODEL, defaults.model);
  const apiKey = firstDefined(
    process.env[`${prefix}API_KEY`],
    process.env.EVAL_API_KEY,
    process.env[`${provider.toUpperCase().replaceAll('-', '_')}_API_KEY`],
    process.env.OPENAI_API_KEY,
    defaults.apiKey
  );
  const baseURL = firstDefined(
    process.env[`${prefix}BASE_URL`],
    process.env.EVAL_BASE_URL,
    process.env[`${provider.toUpperCase().replaceAll('-', '_')}_BASE_URL`],
    process.env.OPENAI_BASE_URL,
    defaults.baseURL
  );

  if (!apiKey) {
    throw new Error(`Provider "${provider}" requires an API key. Configure ${prefix}API_KEY, OPENAI_API_KEY, or eval/providers/.env.`);
  }

  return { provider, model, apiKey, baseURL };
}

function inferProvider() {
  if (process.env.DEEPSEEK_API_KEY) {
    return 'deepseek';
  }
  if (process.env.OPENROUTER_API_KEY) {
    return 'openrouter';
  }
  if (process.env.GEMINI_API_KEY) {
    return 'gemini';
  }
  return 'openai';
}

export function createModelClient(role = 'agent') {
  const config = resolveModelConfig(role);

  return {
    ...config,
    client: new OpenAI({
      apiKey: config.apiKey,
      baseURL: config.baseURL
    })
  };
}