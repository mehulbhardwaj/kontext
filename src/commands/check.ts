import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { execSync } from 'child_process';
import { GeminiClient } from '../llm/gemini';
import { getContext } from '../lib/context';

export const registerCheck = (program: Command) => {
    program
        .command('check')
        .description('Semantically audits staged changes against the context constraints')
        .action(async () => {
            await runCheck();
        });
};

export async function runCheck() {
    console.log(chalk.blue('🛡️  [Kontext Guard] Auditing staged changes...'));

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log(chalk.red("❌ GEMINI_API_KEY required for semantic audit."));
        process.exit(1);
    }

    // 1. Get Staged Diff
    let diff = "";
    try {
        diff = execSync("git diff --cached", { encoding: "utf-8" });
    } catch (e) {
        console.error(chalk.red("❌ Failed to read git diff. Is this a git repo?"));
        process.exit(1);
    }

    if (!diff || diff.trim().length === 0) {
        console.log(chalk.green("✅ No staged changes to check."));
        return;
    }

    // 2. Gather Context
    const cwd = process.cwd();
    const kontextDir = path.join(cwd, '.kontext');
    if (!fs.existsSync(kontextDir)) {
        console.log(chalk.yellow("⚠️  No .kontext found. Skipping audit."));
        return;
    }

    console.log(chalk.dim("   Loading context graph..."));

    // Read Constraints
    let constraints = "";
    const constraintsPath = path.join(kontextDir, 'constraints.md');
    if (fs.existsSync(constraintsPath)) {
        constraints = fs.readFileSync(constraintsPath, 'utf-8');
    }

    // Read Architecture
    let architecture = "";
    const archPath = path.join(kontextDir, 'architecture.md');
    if (fs.existsSync(archPath)) {
        architecture = fs.readFileSync(archPath, 'utf-8');
    }

    // Read Active ADRs
    const { decisions } = await getContext(kontextDir);
    // Filter to only accepted?
    const activeDecisions = decisions
        .filter(d => d.status === 'accepted')
        .map(d => `[${d.id}]: ${d.title}\n${d.body}`) // Pass full body for deep checking? Or Summary?
        // Body is better for semantic checks, but token heavy.
        // Let's stick to full body for now, assuming modest repo size or "Context Compilation" in future.
        .join("\n\n---\n\n");

    const fullContext = `
# Constraints
${constraints}

# Architecture
${architecture}

# Architectural Decision Records (Accepted)
${activeDecisions}
`;

    // 3. Audit
    console.log(chalk.dim("   Asking the Gatekeeper (Gemini)..."));
    const client = new GeminiClient(apiKey);
    const result = await client.auditChange(diff, fullContext);

    // 4. Report
    if (result.approved) {
        console.log(chalk.green("\n✅ Approved. No violations found."));
    } else {
        console.log(chalk.bold.red(`\n❌ Violation Detected!`));
        console.log(chalk.red(`   Reason: ${result.violation}`));
        if (result.citation) {
            console.log(chalk.yellow(`   Citation: ${result.citation}`));
        }
        console.log(chalk.dim("\nPlease fix the violation or update the ADR/Constraints before committing."));
        process.exit(1);
    }
}
