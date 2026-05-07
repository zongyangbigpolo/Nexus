// Copyright © 2026. Citrix Systems, Inc. All Rights Reserved. Confidential & Proprietary.
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

function indentBlock(text, prefix = '    ') {
  return text
    .split('\n')
    .map(line => `${prefix}${line}`)
    .join('\n');
}

function formatWorkspaceContextSection(agentsMarkdown) {
  if (!agentsMarkdown) return '';
  return `\n\n## Workspace Context\n${agentsMarkdown}\n`;
}

function formatInstructionsSection(instructions) {
  if (instructions.length === 0) return '';

  let section = '\n## Instructions\n';
  section += 'Here are the instruction files that contain rules for working with this codebase:\n';

  for (const instruction of instructions) {
    section += `\n### ${instruction.name}\n`;
    if (instruction.description) {
      section += `- Description: ${instruction.description}\n`;
    }
    if (instruction.file) {
      section += `- File: ${instruction.file}\n`;
    }
    if (instruction.applyTo) {
      section += `- Applies To: ${instruction.applyTo}\n`;
    }
    section += '\nContent:\n';
    section += `${indentBlock(instruction.content)}\n`;
  }

  return section;
}

function formatAgentsSection(agents) {
  if (agents.length === 0) return '';

  let section = '\n## Available Agents\n';
  section += 'Available specialized agents:\n';

  for (const agent of agents) {
    section += `\n### ${agent.name}\n`;
    if (agent.description) {
      section += `${agent.description}\n`;
    }
    if(agent.tools && agent.tools.length > 0) {
      section += `- Tools: ${agent.tools.join(', ')}\n`;
    }        
    section += '\nContent:\n';
    section += `${indentBlock(agent.content)}\n`;
  }

  return section;
}

function formatPlaybooksSection(playbooks) {
  if (playbooks.length === 0) return '';

  let section = '\n## Available Playbooks\n';
  section += 'Available specialized playbooks:\n';

  for (const playbook of playbooks) {
    section += `\n### ${playbook.name}\n`;    
    section += '\nContent:\n';
    section += `${indentBlock(playbook.content)}\n`;
  }

  return section;
}

function formatSkillsSection(skills) {
  if (skills.length === 0) return '';

  let section = '\n## Available Skills\n';
  section += 'Available specialized skills:\n';

  for (const skill of skills) {
    section += `\n### ${skill.name}\n`;
    if (skill.description) {
      section += `${skill.description}\n`;
    }    
    section += '\nContent:\n';
    section += `${indentBlock(skill.content)}\n`;
  }

  return section;
}

function findPluginWorkspaceRoot(startPath) {
  // Start from the current file location and look upward for workspace indicators
  let currentPath = startPath;
  
  while (currentPath !== path.dirname(currentPath)) { // Stop at filesystem root
    // Look for workspace indicators    
    const agentsmdPath = path.join(currentPath, 'AGENTS.md');
    
    if (fs.existsSync(agentsmdPath)) {
      return currentPath;
    }
    
    currentPath = path.dirname(currentPath);
  }
  
  // Fallback: assume we're in eval/provider/tools and workspace root is ../../../
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  return path.resolve(__dirname, '../../../');
}

/**
 * Creates the context for agent based on the provided prompt and workspace root. 
 * The context is built in the following order: Prompt -> Agent -> Playbooks -> Skills (+ Instructions)
 * 
 * @param {String} prompt The prompt to generate the agent context for
 * @param {String} workspaceRoot The root directory of the workspace
 * @returns {Object} The agent context containing instructions, agents, skills, and other relevant information
 */
export function loadAgentContext(prompt, workspaceRoot = null) {
  // Auto-discover workspace root if not provided
  if (!workspaceRoot) {
    const __filename = fileURLToPath(import.meta.url);
    workspaceRoot = findPluginWorkspaceRoot(path.dirname(__filename));
  }
  
  const context = {
    instructions: [],
    agents: [],
    skills: [],
    agentsMd: null,
    playbooks: [],
    copilotInstructions: ''
  };

  // Load AGENTS.md from workspace root
  const agentsmdPath = path.join(workspaceRoot, 'AGENTS.md');
  if (fs.existsSync(agentsmdPath)) {
    context.agentsMd = fs.readFileSync(agentsmdPath, 'utf8');
  }

  // Load copilot-instructions.md by default
  const copilotInstructionsPath = path.join(workspaceRoot, 'copilot-instructions.md');
  if (fs.existsSync(copilotInstructionsPath)) {
    const content = fs.readFileSync(copilotInstructionsPath, 'utf8');
    context.copilotInstructions = content;
  }

  // Load instruction files — only those that apply globally (applyTo: "**").
  // Role-specific instructions (e.g. applyTo: "**/*.agent.md") are excluded;
  // injecting them here confuses the model about tool calling conventions.
  const instructionsPath = path.join(workspaceRoot, 'instructions');
  if (fs.existsSync(instructionsPath)) {
    const instructionFiles = fs.readdirSync(instructionsPath)
      .filter(file => file.endsWith('.instructions.md'));
    
    for (const file of instructionFiles) {
      const content = fs.readFileSync(path.join(instructionsPath, file), 'utf8');
      const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (match) {
        const frontmatter = yaml.load(match[1]);
        const applyTo = frontmatter.applyTo;
        // Skip instructions scoped to specific file types (e.g. "**/*.agent.md")
        if (applyTo && applyTo !== '**') continue;
        const body = match[2];
        context.instructions.push({
          name: frontmatter.name || path.basename(file, '.instructions.md'),
          description: frontmatter.description,
          applyTo,
          content: body,
          file: file
        });
      }
    }
  }

  // Load agent files referenced in the prompt or no agents if none specified.
  const referencedAgents = new Set();  
  const promptFrontMatter = prompt.match(/---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (promptFrontMatter) {
    const frontmatter = yaml.load(promptFrontMatter[1]);
    const agentName = frontmatter.agent;
    if (agentName) {
      referencedAgents.add(agentName + '.agent.md');
    }
  }
  
  const agentsPath = path.join(workspaceRoot, 'agents');
  if (fs.existsSync(agentsPath)) {
    const agentFiles = fs.readdirSync(agentsPath)
      .filter(file => file.endsWith('.agent.md'))
      .filter(file => referencedAgents.has(file));
    
    for (const file of agentFiles) {
      const content = fs.readFileSync(path.join(agentsPath, file), 'utf8');
      const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
      if (match) {
        const frontmatter = yaml.load(match[1]);
        const body = match[2];        
        context.agents.push({
          name: frontmatter.name || path.basename(file, '.agent.md'),
          description: frontmatter.description,
          argumentHint: frontmatter['argument-hint']|| '',
          handOffs: frontmatter['handoffs'] || [],
          tools: (frontmatter['tools'] || []).filter(t => t !== 'vscode'),
          content: body,
          file
        });
      }

      // Load all playbooks for this agent under workspaceRoot/agent-assets/<agent-name>/*.playbook.md
      // Look first in agent-assets/<agent-name>
      let playbooksPath = path.join(workspaceRoot, 'agent-assets', path.basename(file, '.agent.md'));
      if (fs.existsSync(playbooksPath)) {
        const playbookFiles = fs.readdirSync(playbooksPath)
          .filter(f => f.endsWith('.playbook.md'));
        for (const playbookFile of playbookFiles) {
          const content = fs.readFileSync(path.join(playbooksPath, playbookFile), 'utf8');
          context.playbooks.push({
            name: playbookFile,            
            content,            
          });
        }
      }      
      else {
        // Look under agent-assets        
        playbooksPath = path.join(workspaceRoot, 'agent-assets')
        if (fs.existsSync(playbooksPath)) {
          // Only load playbook named using the agent name
          const playbookFile = path.join(playbooksPath, `${path.basename(file, '.agent.md')}.playbook.md`);
          if (fs.existsSync(playbookFile)) {
            const content = fs.readFileSync(playbookFile, 'utf8');
            context.playbooks.push({
              name: path.basename(playbookFile),
              content,
            });
          }
        }
      }
    }
  }

  // Load skills referenced in the prompt body only.
  // TODO: load referenced skills in agent as well 
  const referencedSkills = new Set();
  const promptBody = promptFrontMatter ? promptFrontMatter[2] : prompt;
  const skillRefRegex = /\.\.\/(skills|\.\.\/skills)\/([^/]+)\/SKILL\.md/g;
  let skillMatch;
  while ((skillMatch = skillRefRegex.exec(promptBody)) !== null) {
    referencedSkills.add(skillMatch[2]);
  }

  const skillsPath = path.join(workspaceRoot, 'skills');
  if (fs.existsSync(skillsPath)) {
    const skillDirs = fs.readdirSync(skillsPath)
      .filter(item => fs.statSync(path.join(skillsPath, item)).isDirectory())
      .filter(item => referencedSkills.size === 0 || referencedSkills.has(item));
    
    for (const dir of skillDirs) {
      const skillFile = path.join(skillsPath, dir, 'SKILL.md');
      if (fs.existsSync(skillFile)) {
        const content = fs.readFileSync(skillFile, 'utf8');
        const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
        if (match) {
          const frontmatter = yaml.load(match[1]);
          const body = match[2];
          context.skills.push({
            name: frontmatter.name || dir,
            description: frontmatter.description,
            content: body,
            file: skillFile
          });
        }
      }
    }
  }

  return context;
}

export function buildEnhancedSystemPrompt(basePrompt, agentContext, include = {
  skills: true,
  agents: true,
  instructions: true,
  agentsMd: true,
  playbooks: true  
}) {
  let systemPrompt = basePrompt + agentContext.copilotInstructions;
  
  if (include.agentsMd) {
    systemPrompt += formatWorkspaceContextSection(agentContext.agentsMd);
  }
  if (include.instructions) {
    systemPrompt += formatInstructionsSection(agentContext.instructions);
  }
  if (include.agents) {
    systemPrompt += formatAgentsSection(agentContext.agents);
  }
  if (include.skills) {
    systemPrompt += formatSkillsSection(agentContext.skills);
  }
  if(include.playbooks) {
    systemPrompt += formatPlaybooksSection(agentContext.playbooks);
  }

  return systemPrompt;
}