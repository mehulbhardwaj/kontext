import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { GeminiClient } from '../llm/gemini';
import { overwriteFile } from '../lib/fs';
import inquirer from 'inquirer';

export const registerDistill = (program: Command) => {
    program
        .command('distill')
        .description('Prunes duplicate or obsolete contexts into canonical decisions')
        .option('-y, --yes', 'Automatically approve merges without prompting')
        .action(async (options) => {
            await runDistill(false, options.yes);
        });
};

export async function runDistill(quiet: boolean = false, autoApprove: boolean = false) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log(chalk.red("❌ GEMINI_API_KEY required for agentic distillation."));
        return;
    }

    if (!quiet) {
        console.log(chalk.blue('🏺 [Kontext Pruner] examining decision history...'));
    }

    const cwd = process.cwd();
    const decisionsDir = path.join(cwd, '.kontext/decisions');

    if (!fs.existsSync(decisionsDir)) {
        if (!quiet) console.log("No decisions to distill.");
        return;
    }

    // 1. Read All Decisions
    const files = fs.readdirSync(decisionsDir).filter(f => f.endsWith('.md'));
    if (files.length < 2) {
        if (!quiet) console.log(chalk.green("✅ Context is already minimal."));
        return;
    }

    const fileContents = [];
    for (const file of files) {
        fileContents.push({
            path: path.join(decisionsDir, file),
            content: fs.readFileSync(path.join(decisionsDir, file), 'utf-8')
        });
    }

    // 2. Ask Gemini for a Plan
    if (!quiet) console.log(chalk.dim(`Analyzing ${files.length} decisions...`));
    const client = new GeminiClient(apiKey);
    const plan = await client.distillContext(fileContents);

    if (!plan.hasMerge) {
        if (!quiet) console.log(chalk.green("\n✨ No obvious duplicates found. The graph is healthy."));
        return;
    }

    // 3. Present Plan
    if (quiet) {
        // In loop mode, just warn for now. Safe default.
        console.log(chalk.yellow(`\n⚠️  [Pruner] Detected redundancy! Run 'kontext distill' to merge:`));
        console.log(chalk.dim(`   ${plan.rationale}`));
        return;
    }

    console.log(chalk.magenta(`\n💡 Proposed Merge: ${plan.rationale}`));

    console.log(chalk.yellow("\n🪦  SUPERSEDE (Tombstone):"));
    plan.filesToSupersede.forEach((item: any) => console.log(`   - ${path.relative(cwd, item.path)}`));

    console.log(chalk.cyan("\n📄 CREATE/UPDATE Canonical File:"));
    console.log(`   - ${path.relative(cwd, plan.mergedFile.path)}`);

    // 4. Human Approval
    let confirm = autoApprove;
    if (!confirm) {
        const answer = await inquirer.prompt([
            {
                type: 'confirm',
                name: 'confirm',
                message: '⚠️  Do you approve this merge? (Old files will be tombstoned)',
                default: false
            }
        ]);
        confirm = answer.confirm;
    }

    if (confirm) {
        // 5. Execute
        // A. Write new file
        const destPath = path.resolve(cwd, plan.mergedFile.path);

        // Ensure directory exists
        await fs.ensureDir(path.dirname(destPath));

        await overwriteFile(destPath, plan.mergedFile.content);
        console.log(chalk.green(`\nWrote Canonical ADR: ${path.relative(cwd, destPath)}`));

        // Get the ID of the new ADR for linking
        // Naive extraction or just derive from filename
        const newIdMatch = plan.mergedFile.content.match(/id:\s*(.*)/);
        const newId = newIdMatch ? newIdMatch[1].trim() : path.basename(destPath, '.md');

        // B. Tombstone old files
        for (const item of plan.filesToSupersede) {
            const absPathToSupersede = path.resolve(cwd, item.path);

            if (absPathToSupersede !== destPath) {
                // Read original to keep tags/date correctness? 
                // Actually the prompt says Summary is enough.
                // Let's create the Tombstone Content

                // We need to parse the original frontmatter to preserve ID!
                // If we overwrite blindly we lose the ID that others reference.
                let originalId = "unknown";
                try {
                    const originalContent = fs.readFileSync(absPathToSupersede, 'utf-8');
                    const match = originalContent.match(/id:\s*(.*)/);
                    if (match) originalId = match[1].trim();
                } catch (e) { }

                const tombstoneContent = `---
id: ${originalId}
status: superseded
superseded_by: ${newId}
date: ${new Date().toISOString().split('T')[0]} 
---
# [Superseded] ${originalId}

> ⚠️ **This ADR is superseded by [${newId}](./${path.basename(destPath)}).**

**Original Decision Summary:**
${item.summary}
`;
                await overwriteFile(absPathToSupersede, tombstoneContent);
                console.log(chalk.dim(`   🪦  Tombstoned ${path.relative(cwd, absPathToSupersede)}`));
            }
        }

        console.log(chalk.bold.green("\n✨ Pruning Complete."));
    } else {
        console.log(chalk.yellow("Aborted."));
    }
}
