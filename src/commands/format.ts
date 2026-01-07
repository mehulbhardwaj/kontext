import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { GeminiClient } from '../llm/gemini';
import { overwriteFile } from '../lib/fs';
import inquirer from 'inquirer';

export const registerFormat = (program: Command) => {
    program
        .command('format')
        .description('Restructures documentation to strict templates using AI')
        .action(async () => {
            await runFormat();
        });
};

export async function runFormat(targetFiles?: string[]) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log(chalk.red("❌ GEMINI_API_KEY required for agentic formatting."));
        return;
    }

    console.log(chalk.blue('🧹 [Kontext Structurer] auditing documentation...'));
    const client = new GeminiClient(apiKey);
    const cwd = process.cwd();
    const templatesDir = path.join(cwd, '.kontext/templates');

    if (!fs.existsSync(templatesDir)) {
        console.log(chalk.yellow("⚠️ No templates found used default structure."));
        return;
    }

    // If specific files are targeted, only process those
    if (targetFiles && targetFiles.length > 0) {
        // Find template for each file?
        // For simplicity in this iteration:
        // We only support 'decision' and 'architecture' formatting.
        // We need to map file path to type.
        for (const file of targetFiles) {
            if (file.includes('decisions/')) {
                const decisionTemplatePath = path.join(templatesDir, 'decision.md');
                if (fs.existsSync(decisionTemplatePath)) {
                    await processFile(client, path.resolve(cwd, file), fs.readFileSync(decisionTemplatePath, 'utf-8'), 'decision');
                }
            } else if (file.endsWith('architecture.md')) {
                const archTemplatePath = path.join(templatesDir, 'architecture.md');
                if (fs.existsSync(archTemplatePath)) {
                    await processFile(client, path.resolve(cwd, file), fs.readFileSync(archTemplatePath, 'utf-8'), 'architecture');
                }
            }
        }
        return;
    }

    // 1. Format Decisions
    const decisionTemplatePath = path.join(templatesDir, 'decision.md');
    if (fs.existsSync(decisionTemplatePath)) {
        const template = fs.readFileSync(decisionTemplatePath, 'utf-8');
        const decisionsDir = path.join(cwd, '.kontext/decisions');
        if (fs.existsSync(decisionsDir)) {
            const files = fs.readdirSync(decisionsDir).filter(f => f.endsWith('.md'));
            for (const file of files) {
                await processFile(client, path.join(decisionsDir, file), template, 'decision');
            }
        }
    }

    // 2. Format Architecture
    const archTemplatePath = path.join(templatesDir, 'architecture.md');
    if (fs.existsSync(archTemplatePath)) {
        const template = fs.readFileSync(archTemplatePath, 'utf-8');
        const archFile = path.join(cwd, '.kontext/architecture.md');
        if (fs.existsSync(archFile)) {
            await processFile(client, archFile, template, 'architecture');
        }
    }

    console.log(chalk.green("\n✨ Structuring Complete."));
}

async function processFile(client: GeminiClient, filePath: string, template: string, type: 'decision' | 'architecture') {
    const relativePath = path.relative(process.cwd(), filePath);
    process.stdout.write(`Analyzing ${chalk.cyan(relativePath)}... `);

    const content = fs.readFileSync(filePath, 'utf-8');

    // Quick heuristic: simple check if it looks roughly like the template? 
    // For now, let's just Agent it. Or prompts user? 
    // Let's prompt user if they want to format specific files or ALL.
    // For this MVP version, we will auto-format but we could show diff.

    // Better UX: Compute the reformatted version. If it's different, Ask.
    const formatted = await client.restructureContent(content, template, type);

    if (formatted === content || formatted.length < 10) {
        console.log(chalk.green("OK"));
        return;
    }

    // Naive distance check or just prompt
    console.log(chalk.yellow("NEEDS RESTRUCTURE"));

    // In a real CLI, we might want interactive mode.
    // For now, let's just write it (or maybe asking is safer?)
    // Given the Strategy is "Gardening", explicit action "kontext format" implies intent.

    await overwriteFile(filePath, formatted);
    console.log(chalk.green(" → REWRITTEN"));
}
