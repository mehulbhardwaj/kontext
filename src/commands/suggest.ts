import { Command } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import { GeminiClient } from "../llm/gemini";
import chalk from "chalk";
import { runFormat } from "./format";
import { runDistill } from "./distill";
import { runSync } from "./sync";

export const suggestCommand = new Command("suggest")
    .description("Analyze staged changes and suggest context updates")
    .option("-y, --yes", "Automatically apply suggestions without prompting")
    .option("--full", "Run agentic maintence (format/distill) on ALL docs, not just this change")
    .option("--verbose", "Show detailed internal logs")
    .action(async (options) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.log(chalk.yellow("⚠️  GEMINI_API_KEY not found. Skipping suggestion."));
            return;
        }

        if (options.verbose) {
            console.log(chalk.dim("🔍 [Verbose] Mode enabled"));
            console.log(chalk.dim(`🔍 [Verbose] Arguments: prevent_prompt=${options.yes}, full_scan=${options.full}`));
        }

        console.log(chalk.blue("🤖 [Kontext Agent] Starting..."));

        // 1. Get Staged Diff
        let diff = "";
        try {
            diff = execSync("git diff --cached", { encoding: "utf-8" });
        } catch (e) {
            console.error("Failed to read git diff.");
            return;
        }

        const hasChanges = diff.trim().length > 0;

        if (!hasChanges) {
            if (options.full) {
                console.log(chalk.dim("ℹ️  No staged changes. Proceeding to Full Maintenance Loop (--full)..."));
            } else {
                console.log("No staged changes to analyze.");
                return;
            }
        }

        let writtenFiles: string[] = [];

        // ONLY Run Scribe if there are changes
        if (hasChanges) {
            if (options.verbose) console.log(chalk.dim("🔍 [Verbose] Staged changes detected. Running Scribe..."));

            // 2. Read Context (simplified for now: just file list or key files)
            const contextDir = path.resolve(process.cwd(), ".kontext");
            let contextSummary = "No existing context found.";
            if (fs.existsSync(contextDir)) {
                // Read index or strategy to give flavor
                const strategyPath = path.join(contextDir, "strategy.md");
                if (fs.existsSync(strategyPath)) {
                    contextSummary = fs.readFileSync(strategyPath, 'utf-8').substring(0, 500) + "..."; // First 500 chars
                }
            }

            // 3. Call AI
            const client = new GeminiClient(apiKey);
            const suggestion = await client.generateSuggestions(diff, contextSummary);

            // 4. Handle Result
            if (!suggestion.hasDecision) {
                console.log(chalk.green("✅ No architectural changes detected."));
                // If full is NOT set, we stop here. If full IS set, we continue to loop.
                if (!options.full) return;
            } else {
                console.log(chalk.magenta(`\n💡 Suggested Decision: ${suggestion.reasoning}`));

                if (suggestion.proposedFiles && suggestion.proposedFiles.length > 0) {
                    for (const file of suggestion.proposedFiles) {
                        console.log(chalk.cyan(`\n[NEW/MOD] ${file.filePath}`));
                        console.log(chalk.dim(file.content.substring(0, 200) + "...\n"));
                    }

                    let apply = options.yes;
                    if (!apply) {
                        const answer = await inquirer.prompt([
                            {
                                type: "confirm",
                                name: "apply",
                                message: "Do you want to apply these context updates to your commit?",
                                default: true
                            }
                        ]);
                        apply = answer.apply;
                    }

                    if (apply) {
                        for (const file of suggestion.proposedFiles) {
                            const absPath = path.resolve(process.cwd(), file.filePath);
                            fs.ensureDirSync(path.dirname(absPath));
                            fs.writeFileSync(absPath, file.content);
                            console.log(chalk.green(`Wrote ${file.filePath}`));
                            // Auto-stage these files so they are included in the commit!
                            execSync(`git add "${file.filePath}"`);
                            writtenFiles.push(file.filePath);
                        }
                    } else {
                        console.log("Skipping updates.");
                        // If user rejected updates, do we still run loop?
                        // Probably yes if --full is set? Let's say yes.
                    }
                }
            }
        }

        // --- Agentic Loop ---
        console.log(chalk.yellow("\n🔄 Running Agentic Maintenance Loop..."));

        // 1. Structure
        if (options.full) {
            console.log(chalk.dim("   (Full Mode: Scanning all documentation)"));
            await runFormat();
        } else if (writtenFiles.length > 0) {
            await runFormat(writtenFiles);
        } else {
            if (options.verbose) console.log(chalk.dim("ℹ️  No new files to format. Skipping Structurer."));
        }

        // 2. Prune (Quiet Mode)
        // If full, maybe we should be less quiet? Or maybe verbose controls quietness?
        // Let's pass verbose to runDistill?
        await runDistill(true);

        // 3. Broadcast
        await runSync();

        // Re-stage any changes made by the loop
        // (Note: `runFormat` might have modified files we just wrote, or `runDistill` might have deleted some)
        // Simplest is to stage the context dir
        // Re-stage any changes made by the loop
        const filesToStage = ['.kontext'];
        if (fs.existsSync(path.resolve(process.cwd(), '.cursorrules'))) filesToStage.push('.cursorrules');
        if (fs.existsSync(path.resolve(process.cwd(), '.windsurfrules'))) filesToStage.push('.windsurfrules');

        if (filesToStage.length > 0) {
            execSync(`git add ${filesToStage.join(' ')}`);
        }

        console.log(chalk.bold.green("\n✨ Context updated, structured, pruned, synced, and staged."));
    });
