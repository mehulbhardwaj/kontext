"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRemember = void 0;
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const slugify_1 = __importDefault(require("slugify"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const fs_1 = require("../lib/fs");
const templates_1 = require("../lib/templates");
const registerRemember = (program) => {
    program
        .command('remember <title>')
        .description('Record a new architectural decision')
        .action(async (title) => {
        try {
            const cwd = process.cwd();
            const kontextPath = path_1.default.join(cwd, '.kontext');
            const decisionsPath = path_1.default.join(kontextPath, 'decisions');
            if (!(await fs_extra_1.default.pathExists(decisionsPath))) {
                console.error(chalk_1.default.red('Kontext not initialized. Run "kontext init" first.'));
                process.exit(1);
            }
            // Find next ID
            const files = await fs_extra_1.default.readdir(decisionsPath);
            const adrFiles = files.filter(f => f.match(/^adr-\d{3}-.*\.md$/) || f.match(/^adr-\d{3}\.md$/));
            let maxId = 0;
            for (const file of adrFiles) {
                const match = file.match(/^adr-(\d{3})/);
                if (match) {
                    const id = parseInt(match[1], 10);
                    if (id > maxId)
                        maxId = id;
                }
            }
            const nextIdNum = maxId + 1;
            const nextId = `adr-${String(nextIdNum).padStart(3, '0')}`;
            const date = new Date().toISOString().split('T')[0];
            const slug = (0, slugify_1.default)(title, { lower: true, strict: true, trim: true });
            const fileName = `${nextId}-${slug}.md`;
            const filePath = path_1.default.join(decisionsPath, fileName);
            await (0, fs_1.safeWriteFile)(filePath, (0, templates_1.createDecisionTemplate)(nextId, date, title));
            console.log(chalk_1.default.green(`🧠 Decision recorded: .kontext/decisions/${fileName}`));
            // Update index.md last_updated
            const indexPath = path_1.default.join(kontextPath, 'index.md');
            if (await fs_extra_1.default.pathExists(indexPath)) {
                const content = await (0, fs_1.readFile)(indexPath);
                const parsed = (0, gray_matter_1.default)(content);
                parsed.data.last_updated = date;
                // We need to reconstruct the file content carefully to preserve comments if possible, 
                // but gray-matter stringify is usually destructive to custom formatting outside of front-matter.
                // For now, we will use gray-matter stringify which re-writes the file.
                // To preserve the content body, we use parsed.content.
                const newContent = gray_matter_1.default.stringify(parsed.content, parsed.data);
                await (0, fs_1.overwriteFile)(indexPath, newContent);
                // console.log(chalk.gray('Updated index.md timestamp'));
            }
        }
        catch (error) {
            console.error(chalk_1.default.red('Failed to remember:'), error.message);
            process.exit(1);
        }
    });
};
exports.registerRemember = registerRemember;
