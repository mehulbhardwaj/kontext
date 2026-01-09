import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { getContext, filterDecisions, formatContextBlock } from '../lib/context';

const KONTEXT_BLOCK_START = "<!-- KONTEXT_BLOCK_START -->";
const KONTEXT_BLOCK_END = "<!-- KONTEXT_BLOCK_END -->";

export const registerSync = (program: Command) => {
    program
        .command('sync')
        .description('Broadcasts the current Kontext memory to IDE rules (.cursorrules, CLAUDE.md)')
        .option('-f, --focus <tag>', 'Only sync ADRs related to a specific tag (e.g. frontend)')
        .action(async (options) => {
            await runSync(options.focus);
        });
};

export async function runSync(focus?: string) {
    console.log(chalk.blue('🔁 Broadcaster: Compiling Context...'));
    const cwd = process.cwd();
    const kontextDir = path.join(cwd, '.kontext');

    if (!fs.existsSync(kontextDir)) {
        console.log(chalk.red('❌ .kontext directory not found. Run "kontext init" first.'));
        return;
    }

    // 1. Gather Context
    const rawContext = await getContext(kontextDir);
    const totalADRs = rawContext.decisions.length;

    // 2. Filter (Prune)
    const filteredDecisions = filterDecisions(rawContext.decisions, focus);

    if (filteredDecisions.length === 0) {
        console.log(chalk.yellow(`⚠️  No active decisions found${focus ? ` for tag '${focus}'` : ''}. Nothing to sync.`));
        return;
    }

    console.log(chalk.dim(`   Compiling ${filteredDecisions.length}/${totalADRs} ADRs...`));

    // 3. Format the Block (Compile)
    const contextContent = formatContextBlock(filteredDecisions);
    const block = `
${KONTEXT_BLOCK_START}
# 🧠 Kontext Memory (Auto-Generated)
# Do not edit this block manually. Run "npx kontext sync" to update.
# Source of Truth: .kontext/

${contextContent}

# 🤖 Agent Instructions:
# 1. Respect the constraints in the table above.
# 2. If you propose changes that conflict with an Accepted ADR, you MUST ask the user.
# 3. New architectural choices? Run "npx kontext suggest".
${KONTEXT_BLOCK_END}
`;

    // 4. Inject into Rules
    // Target Files: .cursorrules, .windsurfrules, CLAUDE.md
    const ruleFiles = ['.cursorrules', '.windsurfrules', 'CLAUDE.md'];
    let updatedCount = 0;

    for (const file of ruleFiles) {
        const filePath = path.join(cwd, file);

        // Strategy: Only update if file ALREADY exists.
        // We do not want to pollute projects that don't use these tools.
        if (fs.existsSync(filePath)) {
            await updateRuleFile(filePath, block);
            console.log(chalk.green(`✅ Updated ${file}`));
            updatedCount++;
        }
    }
}

async function updateRuleFile(filePath: string, newBlock: string) {
    let content = await fs.readFile(filePath, 'utf-8');
    const escapedStart = escapeRegExp(KONTEXT_BLOCK_START);
    const escapedEnd = escapeRegExp(KONTEXT_BLOCK_END);

    // Regex to find existing block (multiline)
    const regex = new RegExp(`${escapedStart}[\\s\\S]*?${escapedEnd}`, 'g');

    if (regex.test(content)) {
        // Replace existing block
        content = content.replace(regex, newBlock.trim());
    } else {
        // Append new block
        content += `\n\n${newBlock.trim()}`;
    }

    await fs.writeFile(filePath, content, 'utf-8');
}

function escapeRegExp(string: string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
