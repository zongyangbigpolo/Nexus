import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(new URL('..', import.meta.url).pathname);
const errors = [];
const warnings = [];

function readJson(relativePath) {
  const filePath = path.join(root, relativePath);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (error) {
    errors.push(`${relativePath}: invalid JSON (${error.message})`);
    return null;
  }
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

function listFiles(directory, predicate) {
  const absoluteDirectory = path.join(root, directory);
  if (!fs.existsSync(absoluteDirectory)) {
    return [];
  }

  const results = [];
  const stack = [absoluteDirectory];

  while (stack.length > 0) {
    const current = stack.pop();
    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        stack.push(fullPath);
      } else if (!predicate || predicate(fullPath)) {
        results.push(path.relative(root, fullPath));
      }
    }
  }

  return results.sort((left, right) => left.localeCompare(right));
}

function parseFrontmatter(relativePath) {
  const content = fs.readFileSync(path.join(root, relativePath), 'utf8');
  if (!content.startsWith('---\n')) {
    errors.push(`${relativePath}: missing YAML frontmatter`);
    return {};
  }

  const endIndex = content.indexOf('\n---', 4);
  if (endIndex === -1) {
    errors.push(`${relativePath}: unterminated YAML frontmatter`);
    return {};
  }

  const block = content.slice(4, endIndex);
  const data = {};
  for (const line of block.split(/\r?\n/)) {
    const match = line.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (match) {
      data[match[1]] = match[2].trim().replaceAll(/^['"]|['"]$/g, '');
    }
  }

  return data;
}

function basenameWithoutSuffix(relativePath, suffix) {
  return path.basename(relativePath).slice(0, -suffix.length);
}

function validateFrontmatter(file, requiredFields) {
  const frontmatter = parseFrontmatter(file);
  for (const field of requiredFields) {
    if (!frontmatter[field]) {
      errors.push(`${file}: missing frontmatter field "${field}"`);
    }
  }
  return frontmatter;
}

function countAssets(pluginPath) {
  return {
    commands: listFiles(`${pluginPath}/commands`, (file) => file.endsWith('.md')).length,
    agents: listFiles(`${pluginPath}/agents`, (file) => file.endsWith('.agent.md')).length,
    skills: listFiles(`${pluginPath}/skills`, (file) => path.basename(file) === 'SKILL.md').length,
    instructions: listFiles(`${pluginPath}/instructions`, (file) => file.endsWith('.instructions.md')).length
  };
}

const marketplace = readJson('.github/plugin/marketplace.json');
if (marketplace) {
  if (!marketplace.name) errors.push('.github/plugin/marketplace.json: missing name');
  if (!marketplace.metadata?.pluginRoot) errors.push('.github/plugin/marketplace.json: missing metadata.pluginRoot');

  const pluginRoot = marketplace.metadata?.pluginRoot?.replace(/^\.\//, '') || 'plugins';
  if (!exists(pluginRoot)) errors.push(`marketplace pluginRoot does not exist: ${pluginRoot}`);

  const registeredSources = new Set((marketplace.plugins || []).map((plugin) => plugin.source));
  const pluginFolders = fs.readdirSync(path.join(root, pluginRoot), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();

  for (const folder of pluginFolders) {
    const manifestPath = `${pluginRoot}/${folder}/.github/plugin/plugin.json`;
    if (exists(manifestPath) && !registeredSources.has(folder)) {
      errors.push(`${folder}: plugin has a manifest but is not registered in marketplace.json`);
    }
  }

  for (const plugin of marketplace.plugins || []) {
    if (!plugin.name || !plugin.source || !plugin.version || !plugin.description) {
      errors.push(`marketplace plugin entry is incomplete: ${JSON.stringify(plugin)}`);
      continue;
    }

    const pluginPath = `${pluginRoot}/${plugin.source}`;
    const manifestPath = `${pluginPath}/.github/plugin/plugin.json`;
    if (!exists(pluginPath)) {
      errors.push(`${plugin.source}: marketplace source directory does not exist`);
      continue;
    }
    if (!exists(manifestPath)) {
      errors.push(`${plugin.source}: missing plugin manifest at ${manifestPath}`);
      continue;
    }

    const manifest = readJson(manifestPath);
    if (!manifest) continue;
    if (manifest.name !== plugin.name) {
      errors.push(`${manifestPath}: manifest name "${manifest.name}" does not match marketplace name "${plugin.name}"`);
    }

    for (const field of ['commands', 'agents', 'skills', 'mcpServers']) {
      if (!manifest[field]) {
        errors.push(`${manifestPath}: missing field "${field}"`);
        continue;
      }
      const target = path.posix.join(pluginPath, manifest[field].replace(/^\.\//, ''));
      if (!exists(target)) {
        errors.push(`${manifestPath}: ${field} path does not exist (${target})`);
      }
    }

    const agentFiles = listFiles(`${pluginPath}/agents`, (file) => file.endsWith('.agent.md'));
    const commandFiles = listFiles(`${pluginPath}/commands`, (file) => file.endsWith('.md'));
    const skillFiles = listFiles(`${pluginPath}/skills`, (file) => path.basename(file) === 'SKILL.md');
    const instructionFiles = listFiles(`${pluginPath}/instructions`, (file) => file.endsWith('.instructions.md'));

    const pluginAgentNames = new Set(agentFiles.map((file) => basenameWithoutSuffix(file, '.agent.md')));
    const allAgentNames = new Set(listFiles('plugins', (file) => file.endsWith('.agent.md')).map((file) => basenameWithoutSuffix(file, '.agent.md')));

    for (const file of commandFiles) {
      const frontmatter = validateFrontmatter(file, ['name', 'description']);
      const expectedName = basenameWithoutSuffix(file, '.md');
      if (frontmatter.name && frontmatter.name !== expectedName) {
        warnings.push(`${file}: frontmatter name "${frontmatter.name}" differs from file name "${expectedName}"`);
      }
      if (frontmatter.agent && !allAgentNames.has(frontmatter.agent)) {
        errors.push(`${file}: command references unknown agent "${frontmatter.agent}"`);
      }
    }

    for (const file of agentFiles) {
      const frontmatter = validateFrontmatter(file, ['name', 'description']);
      const expectedName = basenameWithoutSuffix(file, '.agent.md');
      if (frontmatter.name && frontmatter.name !== expectedName) {
        warnings.push(`${file}: frontmatter name "${frontmatter.name}" differs from file name "${expectedName}"`);
      }

      const content = fs.readFileSync(path.join(root, file), 'utf8');
      for (const match of content.matchAll(/agent:\s*([A-Za-z0-9_-]+)/g)) {
        const targetAgent = match[1];
        if (!allAgentNames.has(targetAgent)) {
          errors.push(`${file}: handoff references unknown agent "${targetAgent}"`);
        }
      }

      if (!pluginAgentNames.has(expectedName)) {
        warnings.push(`${file}: agent not indexed in plugin agent set`);
      }
    }

    for (const file of skillFiles) {
      validateFrontmatter(file, ['name', 'description']);
    }

    for (const file of instructionFiles) {
      validateFrontmatter(file, ['name', 'description', 'applyTo']);
    }

    const counts = countAssets(pluginPath);
    console.log(`${plugin.name}: ${counts.commands} commands, ${counts.agents} agents, ${counts.skills} skills, ${counts.instructions} instructions`);
  }
}

if (marketplace === null) {
  process.exitCode = 1;
}

const evalConfigs = listFiles('eval/tests', (file) => path.basename(file) === 'promptfooconfig.yaml');
for (const config of evalConfigs) {
  const content = fs.readFileSync(path.join(root, config), 'utf8');
  const promptFileMatch = content.match(/__promptFile:\s*([^\s#]+)/);
  if (promptFileMatch) {
    const promptFile = promptFileMatch[1].trim().replaceAll(/^['"]|['"]$/g, '');
    const promptPath = `plugins/${promptFile}`;
    if (!exists(promptPath)) {
      errors.push(`${config}: __promptFile does not exist (${promptPath})`);
    }
  }

  for (const providerMatch of content.matchAll(/file:\/\/([^\s]+)/g)) {
    const referenced = providerMatch[1].replaceAll(/^['"]|['"]$/g, '');
    const resolved = path.normalize(path.join(path.dirname(config), referenced));
    if (!exists(resolved)) {
      errors.push(`${config}: referenced file does not exist (${resolved})`);
    }
  }
}

if (warnings.length > 0) {
  console.warn('\nWarnings:');
  for (const warning of warnings) console.warn(`- ${warning}`);
}

if (errors.length > 0) {
  console.error('\nValidation failed:');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log('\nAsset validation passed.');
