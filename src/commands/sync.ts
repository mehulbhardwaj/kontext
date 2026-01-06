import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { safeWriteFile } from '../lib/fs';

const KONTEXT_BLOCK_START = "<!-- KONTEXT_START -->";
const KONTEXT_BLOCK_END = "<!-- KONTEXT_END -->";

export const registerSync = (program: Command) => {
    program
        .command('sync')
        .description('Broadcasts the current Kontext state to IDE rules (.cursorrules, etc)')
        .action(async () => {
            console.log(chalk.blue('🔁 Broadcasting Context to IDE...'));
            const cwd = process.cwd();
            const kontextDir = path.join(cwd, '.kontext');

            if (!fs.existsSync(kontextDir)) {
                console.log(chalk.red('❌ .kontext directory not found. Run "kontext init" first.'));
                return;
            }

            // 1. Gather Context
            const contextSummary = await gatherContext(kontextDir);

            // 2. Format the Block
            const block = formatBlock(contextSummary);

            // 3. Inject into Rules
            const ruleFiles = ['.cursorrules', '.windsurfrules'];
            let updatedCount = 0;

            for (const file of ruleFiles) {
                const filePath = path.join(cwd, file);
                if (fs.existsSync(filePath)) {
                    await updateRuleFile(filePath, block);
                    console.log(chalk.green(`✅ Updated ${file}`));
                    updatedCount++;
                }
            }

            if (updatedCount === 0) {
                console.log(chalk.yellow('⚠️  No IDE rule files found (.cursorrules, .windsurfrules).'));
            }
        });
};

async function gatherContext(kontextDir: string): Promise<string> {
    let summary = "## Project Context (Managed by Kontext)\n";

    // Read Architecture
    const archFile = path.join(kontextDir, 'architecture.md');
    if (fs.existsSync(archFile)) {
        const archContent = await fs.readFile(archFile, 'utf-8');
        // Simple extraction: take content after first header or YAML
        summary += `\n### Architecture\n${cleanMarkdown(archContent)}\n`;
    }

    // Read Constraints
    const constraintsFile = path.join(kontextDir, 'constraints.md');
    if (fs.existsSync(constraintsFile)) {
        const constraintsContent = await fs.readFile(constraintsFile, 'utf-8');
        summary += `\n### Constraints\n${cleanMarkdown(constraintsContent)}\n`;
    }

    // Read active decisions (Active/Accepted only) - naive limit for now
    const decisionsDir = path.join(kontextDir, 'decisions');
    if (fs.existsSync(decisionsDir)) {
        const files = await fs.readdir(decisionsDir);
        const activeDecisions = [];
        for (const f of files) {
            if (f.endsWith('.md')) {
                const content = await fs.readFile(path.join(decisionsDir, f), 'utf-8');
                if (content.includes('status: accepted')) {
                    // Extract title
                    const lines = content.split('\n');
                    const title = lines.find(l => l.startsWith('# ')) || f;
                    activeDecisions.push(`- [${f}] ${title.replace('# ', '')}`);
                }
            }
        }
        if (activeDecisions.length > 0) {
            summary += `\n### Accepted Decisions\n${activeDecisions.slice(0, 5).join('\n')}\n(See .kontext/decisions for full history)\n`;
        }
    }

    return summary;
}

function cleanMarkdown(content: string): string {
    // Remove YAML frontmatter if present
    if (content.startsWith('---')) {
        const parts = content.split('---');
        if (parts.length >= 3) {
            return parts.slice(2).join('---').trim();
        }
    }
    return content.trim();
}

function formatBlock(content: string): string {
    return `${KONTEXT_BLOCK_START}\n${content}\n${KONTEXT_BLOCK_END}`;
}

async function updateRuleFile(filePath: string, newBlock: string) {
    let content = await fs.readFile(filePath, 'utf-8');

    const regex = new RegExp(`${escapeRegExp(KONTEXT_BLOCK_START)}[\\s\\S]*?${escapeRegExp(KONTEXT_BLOCK_END)}`, 'g');

    if (regex.test(content)) {
        // Replace existing block
        content = content.replace(regex, newBlock);
    } else {
        // Append new block
        content += `\n\n${newBlock}`;
    }

    await fs.writeFile(filePath, content, 'utf-8');
}

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}
