import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { GeminiClient } from '../llm/gemini';
import { safeWriteFile, overwriteFile } from '../lib/fs';
import slugify from 'slugify';

export const registerFormat = (program: Command) => {
    program
        .command('format [file]')
        .description('Structures unstructured content into the schema. If [file] is provided, imports it as a new ADR.')
        .action(async (file) => {
            await runFormat(file);
        });
};

export async function runFormat(input?: string | string[]) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log(chalk.red("❌ GEMINI_API_KEY required for agentic formatting."));
        return;
    }

    const client = new GeminiClient(apiKey);
    const cwd = process.cwd();
    const templatesDir = path.join(cwd, '.kontext/templates');

    // Handle Array Input (from suggest.ts) - Just recurse for now
    if (Array.isArray(input)) {
        for (const file of input) {
            await runFormat(file); // Recurse 
        }
        return;
    }

    // Standard Single File Logic
    const inputFile = input;
    // ... rest of function ...
    const decisionTemplatePath = path.join(templatesDir, 'decision.md');

    if (!fs.existsSync(decisionTemplatePath)) {
        console.log(chalk.red("❌ Template not found: .kontext/templates/decision.md"));
        return;
    }
    const template = fs.readFileSync(decisionTemplatePath, 'utf-8');

    // Case 1: Import Mode (Single File)
    if (inputFile) {
        const inputPath = path.resolve(cwd, inputFile);
        if (!fs.existsSync(inputPath)) {
            console.log(chalk.red(`❌ File not found: ${inputFile}`));
            return;
        }

        console.log(chalk.blue(`📥 Importing ${inputFile} into knowledge graph...`));
        const content = fs.readFileSync(inputPath, 'utf-8');

        // Generate Filename
        const decisionsDir = path.join(cwd, '.kontext/decisions');
        const nextId = await getNextId(decisionsDir);

        // Ask AI to structure it
        console.log(chalk.dim("   AI structuring content..."));
        const structured = await client.restructureContent(content, template, 'decision');

        // Extract Title for Slug (Naive regex or just ask AI? Let's use naive for speed)
        const titleMatch = structured.match(/^# .*: (.*$)/m);
        const title = titleMatch ? titleMatch[1] : "Untitled";
        const filename = `${nextId}-${slugify(title, { lower: true, strict: true })}.md`;

        // Inject ID into the content (The AI might have left {id} or put placeholder)
        // We replace "id: {id}" or "id: .*" in frontmatter
        const finalContent = structured
            .replace(/id: \{id\}/, `id: ${nextId}`)
            .replace(/id: .*/, `id: ${nextId}`) // Safety net if AI halluncinated an ID
            .replace(/^# .*:/m, `# ${nextId}:`); // Fix header ID

        const outputPath = path.join(decisionsDir, filename);
        await safeWriteFile(outputPath, finalContent);

        console.log(chalk.green(`✅ Created ${filename}`));
        return;
    }

    // Case 2: Maintenance Mode (Scan existing)
    console.log(chalk.blue('🧹 [Kontext Structurer] auditing existing documentation...'));
    const decisionsDir = path.join(cwd, '.kontext/decisions');
    if (fs.existsSync(decisionsDir)) {
        const files = fs.readdirSync(decisionsDir).filter(f => f.endsWith('.md'));
        for (const file of files) {
            await processFile(client, path.join(decisionsDir, file), template, 'decision');
        }
    } else {
        console.log(chalk.yellow("No .kontext/decisions directory found."));
    }

    console.log(chalk.green("\n✨ Auditing Complete."));
}

async function getNextId(dir: string): Promise<string> {
    if (!fs.existsSync(dir)) return "adr-001";
    const files = await fs.readdir(dir);
    const ids = files
        .map(f => f.match(/adr-(\d+)/))
        .filter(m => m !== null)
        .map(m => parseInt(m![1], 10));

    if (ids.length === 0) return "adr-001";
    const max = Math.max(...ids);
    return `adr-${String(max + 1).padStart(3, '0')}`;
}

async function processFile(client: GeminiClient, filePath: string, template: string, type: 'decision' | 'architecture') {
    const relativePath = path.relative(process.cwd(), filePath);
    process.stdout.write(`Checking ${chalk.cyan(relativePath)}... `);

    const content = fs.readFileSync(filePath, 'utf-8');
    const formatted = await client.restructureContent(content, template, type);

    // Simple heuristic: if length implies huge change or structural fix
    if (formatted === content) {
        console.log(chalk.green("OK"));
        return;
    }

    // We overwrite in Maintenance mode for now (assuming git tracks history)
    await overwriteFile(filePath, formatted);
    console.log(chalk.yellow(" REFORMATTED"));
}
