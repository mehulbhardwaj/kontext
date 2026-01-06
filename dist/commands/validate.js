"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerValidate = void 0;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const schemas_1 = require("../lib/schemas");
const registerValidate = (program) => {
    program
        .command('validate')
        .description('Validate the integrity of kontext state')
        .action(async () => {
        try {
            const cwd = process.cwd();
            const kontextPath = path_1.default.join(cwd, '.kontext');
            if (!(await fs_extra_1.default.pathExists(kontextPath))) {
                console.error(chalk_1.default.red('Kontext directory not found.'));
                process.exit(1);
            }
            let hasError = false;
            let fileCount = 0;
            let decisionCount = 0;
            // validate index.md
            const indexPath = path_1.default.join(kontextPath, 'index.md');
            if (await fs_extra_1.default.pathExists(indexPath)) {
                fileCount++;
                const content = await fs_extra_1.default.readFile(indexPath, 'utf-8');
                const parsed = (0, gray_matter_1.default)(content);
                const result = schemas_1.IndexSchema.safeParse(parsed.data);
                if (!result.success) {
                    console.error(chalk_1.default.red(`❌ index.md invalid:`));
                    console.error(result.error.issues);
                    hasError = true;
                }
            }
            else {
                console.error(chalk_1.default.red(`❌ index.md missing`));
                hasError = true;
            }
            // validate decisions
            const decisionsPath = path_1.default.join(kontextPath, 'decisions');
            if (await fs_extra_1.default.pathExists(decisionsPath)) {
                const files = await fs_extra_1.default.readdir(decisionsPath);
                for (const file of files) {
                    if (!file.endsWith('.md'))
                        continue;
                    fileCount++;
                    decisionCount++;
                    const content = await fs_extra_1.default.readFile(path_1.default.join(decisionsPath, file), 'utf-8');
                    const parsed = (0, gray_matter_1.default)(content);
                    // Check if filename matches ID
                    const match = file.match(/^(adr-\d{3})/);
                    if (!match) {
                        console.error(chalk_1.default.red(`❌ Invalid filename format: ${file}`));
                        hasError = true;
                        continue;
                    }
                    const fileId = match[1];
                    const result = schemas_1.DecisionSchema.safeParse(parsed.data);
                    if (!result.success) {
                        console.error(chalk_1.default.red(`❌ ${file} invalid:`));
                        console.error(result.error.issues);
                        hasError = true;
                    }
                    else {
                        if (result.data.id !== fileId) {
                            console.error(chalk_1.default.red(`❌ ${file} validation error: ID in front-matter (${result.data.id}) does not match filename (${fileId})`));
                            hasError = true;
                        }
                    }
                }
            }
            if (hasError) {
                console.log(chalk_1.default.red('\nValidation failed.'));
                process.exit(1);
            }
            else {
                console.log(chalk_1.default.green(`\n✅ State is valid. (${fileCount} files, ${decisionCount} decisions)`));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Validation failed with error:'), error.message);
            process.exit(1);
        }
    });
};
exports.registerValidate = registerValidate;
