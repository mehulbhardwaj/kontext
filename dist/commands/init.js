"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerInit = void 0;
const inquirer_1 = __importDefault(require("inquirer"));
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const fs_1 = require("../lib/fs");
const templates_1 = require("../lib/templates");
const registerInit = (program) => {
    program
        .command('init')
        .description('Initialize kontext state in the current repository')
        .action(async () => {
        console.log(chalk_1.default.blue('Initializing Kontext State...'));
        const cwd = process.cwd();
        const projectPackageJson = path_1.default.join(cwd, 'package.json');
        let projectName = 'My Project';
        if (await fs_extra_1.default.pathExists(projectPackageJson)) {
            try {
                const pkg = await fs_extra_1.default.readJson(projectPackageJson);
                if (pkg.name)
                    projectName = pkg.name;
            }
            catch (e) {
                // ignore
            }
        }
        try {
            const { kontextPath, decisionsPath } = await (0, fs_1.ensureKontextDir)(cwd);
            // Create default files
            const today = new Date().toISOString().split('T')[0];
            // We use try/catch for safeWriteFile to warn if exists, but not fail entirely
            try {
                await (0, fs_1.safeWriteFile)(path_1.default.join(kontextPath, 'index.md'), (0, templates_1.createIndexTemplate)(today, projectName));
                console.log(chalk_1.default.green('Created kontext/index.md'));
            }
            catch (e) {
                console.log(chalk_1.default.yellow(`Skipped index.md: ${e.message}`));
            }
            try {
                await (0, fs_1.safeWriteFile)(path_1.default.join(kontextPath, 'architecture.md'), (0, templates_1.createArchitectureTemplate)());
                console.log(chalk_1.default.green('Created kontext/architecture.md'));
            }
            catch (e) {
                console.log(chalk_1.default.yellow(`Skipped architecture.md: ${e.message}`));
            }
            try {
                await (0, fs_1.safeWriteFile)(path_1.default.join(kontextPath, 'constraints.md'), (0, templates_1.createConstraintsTemplate)());
                console.log(chalk_1.default.green('Created kontext/constraints.md'));
            }
            catch (e) {
                console.log(chalk_1.default.yellow(`Skipped constraints.md: ${e.message}`));
            }
            try {
                await (0, fs_1.safeWriteFile)(path_1.default.join(kontextPath, 'setup.md'), (0, templates_1.createSetupTemplate)());
                console.log(chalk_1.default.green('Created kontext/setup.md'));
            }
            catch (e) {
                console.log(chalk_1.default.yellow(`Skipped setup.md: ${e.message}`));
            }
            // Context Bridge
            await handleContextBridge(cwd);
            console.log(chalk_1.default.bold.green('\n✅ Kontext State initialized.'));
            console.log(`👉 Run ${chalk_1.default.cyan('kontext remember "We are using Next.js"')} to create your first decision.`);
        }
        catch (error) {
            console.error(chalk_1.default.red('Failed to initialize:'), error.message);
            process.exit(1);
        }
    });
};
exports.registerInit = registerInit;
async function handleContextBridge(cwd) {
    const contextFiles = ['.cursorrules', '.windsurfrules'];
    const foundFiles = [];
    for (const file of contextFiles) {
        if (await fs_extra_1.default.pathExists(path_1.default.join(cwd, file))) {
            foundFiles.push(file);
        }
    }
    if (foundFiles.length === 0)
        return;
    const { addToContext } = await inquirer_1.default.prompt([
        {
            type: 'confirm',
            name: 'addToContext',
            message: `Found ${foundFiles.join(', ')}. Add Kontext instructions to them?`,
            default: true
        }
    ]);
    if (addToContext) {
        const instructionBlock = `\n\n# Kontext State
This project uses Kontext State for architectural decisions.
- Read .kontext/index.md for context.
- Check .kontext/decisions/ for history.
`;
        for (const file of foundFiles) {
            await (0, fs_1.appendToFile)(path_1.default.join(cwd, file), instructionBlock);
            console.log(chalk_1.default.green(`Updated ${file}`));
        }
    }
}
