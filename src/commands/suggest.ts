import { Command } from "commander";
import inquirer from "inquirer";
import fs from "fs-extra";
import path from "path";
import { execSync } from "child_process";
import { GeminiClient } from "../llm/gemini";
import chalk from "chalk";

export const suggestCommand = new Command("suggest")
    .description("Analyze staged changes and suggest context updates")
    .option("-y, --yes", "Automatically apply suggestions without prompting")
    .action(async (options) => {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.log(chalk.yellow("⚠️  GEMINI_API_KEY not found. Skipping suggestion."));
            return;
        }

        console.log(chalk.blue("🤖 [Kontext Agent] Analyzing changes..."));

        // 1. Get Staged Diff
        let diff = "";
        try {
            diff = execSync("git diff --cached", { encoding: "utf-8" });
        } catch (e) {
            console.error("Failed to read git diff.");
            return;
        }

        if (!diff.trim()) {
            console.log("No staged changes to analyze.");
            return;
        }

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
            return;
        }

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
                }
                console.log(chalk.green("✨ Context updated and staged."));
            } else {
                console.log("Skipping updates.");
            }
        }
    });
