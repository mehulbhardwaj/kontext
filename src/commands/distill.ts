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
        .action(async () => {
            await runDistill(false);
        });
};

export async function runDistill(quiet: boolean = false) {
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

    console.log(chalk.red("\n🗑  DELETE:"));
    plan.filesToDelete.forEach((f: string) => console.log(`   - ${path.relative(cwd, f)}`));

    console.log(chalk.cyan("\n📄 CREATE/UPDATE Canonical File:"));
    console.log(`   - ${path.relative(cwd, plan.mergedFile.path)}`);

    // 4. Human Approval
    const { confirm } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'confirm',
            message: '⚠️  Do you approve this destructive merge? (Git history will be preserved)',
            default: false
        }
    ]);

    if (confirm) {
        // 5. Execute
        // A. Write new file
        const destPath = path.resolve(cwd, plan.mergedFile.path);
        await overwriteFile(destPath, plan.mergedFile.content);
        console.log(chalk.green(`\nWrote ${path.relative(cwd, destPath)}`));

        // B. Delete old files
        for (const fileToDelete of plan.filesToDelete) {
            const absPathToDelete = path.resolve(cwd, fileToDelete);
            if (absPathToDelete !== destPath) {
                fs.unlinkSync(absPathToDelete);
                console.log(chalk.red(`Deleted ${path.relative(cwd, absPathToDelete)}`));
            }
        }

        console.log(chalk.bold.green("\n✨ Pruning Complete."));
    } else {
        console.log(chalk.yellow("Aborted."));
    }
}
