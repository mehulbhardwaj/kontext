"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.suggestCommand = void 0;
const commander_1 = require("commander");
const inquirer_1 = __importDefault(require("inquirer"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const gemini_1 = require("../llm/gemini");
const chalk_1 = __importDefault(require("chalk"));
const format_1 = require("./format");
const distill_1 = require("./distill");
const sync_1 = require("./sync");
exports.suggestCommand = new commander_1.Command("suggest")
    .description("Analyze staged changes and suggest context updates")
    .option("-y, --yes", "Automatically apply suggestions without prompting")
    .action(async (options) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.log(chalk_1.default.yellow("⚠️  GEMINI_API_KEY not found. Skipping suggestion."));
        return;
    }
    console.log(chalk_1.default.blue("🤖 [Kontext Agent] Analyzing changes..."));
    // 1. Get Staged Diff
    let diff = "";
    try {
        diff = (0, child_process_1.execSync)("git diff --cached", { encoding: "utf-8" });
    }
    catch (e) {
        console.error("Failed to read git diff.");
        return;
    }
    if (!diff.trim()) {
        console.log("No staged changes to analyze.");
        return;
    }
    // 2. Read Context (simplified for now: just file list or key files)
    const contextDir = path_1.default.resolve(process.cwd(), ".kontext");
    let contextSummary = "No existing context found.";
    if (fs_extra_1.default.existsSync(contextDir)) {
        // Read index or strategy to give flavor
        const strategyPath = path_1.default.join(contextDir, "strategy.md");
        if (fs_extra_1.default.existsSync(strategyPath)) {
            contextSummary = fs_extra_1.default.readFileSync(strategyPath, 'utf-8').substring(0, 500) + "..."; // First 500 chars
        }
    }
    // 3. Call AI
    const client = new gemini_1.GeminiClient(apiKey);
    const suggestion = await client.generateSuggestions(diff, contextSummary);
    // 4. Handle Result
    if (!suggestion.hasDecision) {
        console.log(chalk_1.default.green("✅ No architectural changes detected."));
        return;
    }
    console.log(chalk_1.default.magenta(`\n💡 Suggested Decision: ${suggestion.reasoning}`));
    if (suggestion.proposedFiles && suggestion.proposedFiles.length > 0) {
        for (const file of suggestion.proposedFiles) {
            console.log(chalk_1.default.cyan(`\n[NEW/MOD] ${file.filePath}`));
            console.log(chalk_1.default.dim(file.content.substring(0, 200) + "...\n"));
        }
        let apply = options.yes;
        if (!apply) {
            const answer = await inquirer_1.default.prompt([
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
            const writtenFiles = [];
            for (const file of suggestion.proposedFiles) {
                const absPath = path_1.default.resolve(process.cwd(), file.filePath);
                fs_extra_1.default.ensureDirSync(path_1.default.dirname(absPath));
                fs_extra_1.default.writeFileSync(absPath, file.content);
                console.log(chalk_1.default.green(`Wrote ${file.filePath}`));
                // Auto-stage these files so they are included in the commit!
                (0, child_process_1.execSync)(`git add "${file.filePath}"`);
                writtenFiles.push(file.filePath);
            }
            // --- Agentic Loop ---
            console.log(chalk_1.default.yellow("\n🔄 Running Agentic Maintenance Loop..."));
            // 1. Structure
            await (0, format_1.runFormat)(writtenFiles);
            // 2. Prune (Quiet Mode)
            await (0, distill_1.runDistill)(true);
            // 3. Broadcast
            await (0, sync_1.runSync)();
            // Re-stage any changes made by the loop
            // (Note: `runFormat` might have modified files we just wrote, or `runDistill` might have deleted some)
            // Simplest is to stage the context dir
            (0, child_process_1.execSync)(`git add .kontext .cursorrules .windsurfrules`);
            console.log(chalk_1.default.bold.green("\n✨ Context updated, structured, pruned, synced, and staged."));
        }
        else {
            console.log("Skipping updates.");
        }
    }
});
