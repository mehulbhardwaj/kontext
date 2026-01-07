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
        .description('Broadcasts the current Kontext memory to IDE rules (.cursorrules, etc)')
        .action(async () => {
            await runSync();
        });
};

export async function runSync() {
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
}

async function gatherContext(kontextDir: string): Promise<string> {
    // Minimal Bridge Strategy:
    // Don't dump the whole context. Just point the AI to the source of truth.
    return `## Kontext Memory Active
This project uses Kontext for architectural decisions.

- **Truth Source**: Read \`.kontext/index.md\` and following links.
- **Constraints**: Check \`.kontext/constraints.md\` before coding.
- **Decision History**: See \`.kontext/decisions/\` for ADRs.

🤖 **Agent Instructions**:
1. If you make a significant architectural choice, ask the user to run \`kontext suggest\`.
2. Do not invent patterns that conflict with \`.kontext/architecture.md\`.
`;
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
