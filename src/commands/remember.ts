import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import slugify from 'slugify';
import matter from 'gray-matter';
import { safeWriteFile, overwriteFile, readFile } from '../lib/fs';
import { createDecisionTemplate } from '../lib/templates';

export const registerRemember = (program: Command) => {
    program
        .command('remember <title>')
        .description('Record a new architectural decision')
        .action(async (title: string) => {
            try {
                const cwd = process.cwd();
                const kontextPath = path.join(cwd, '.kontext');
                const decisionsPath = path.join(kontextPath, 'decisions');

                if (!(await fs.pathExists(decisionsPath))) {
                    console.error(chalk.red('Kontext not initialized. Run "kontext init" first.'));
                    process.exit(1);
                }

                // Find next ID
                const files = await fs.readdir(decisionsPath);
                const adrFiles = files.filter(f => f.match(/^adr-\d{3}-.*\.md$/) || f.match(/^adr-\d{3}\.md$/));

                let maxId = 0;
                for (const file of adrFiles) {
                    const match = file.match(/^adr-(\d{3})/);
                    if (match) {
                        const id = parseInt(match[1], 10);
                        if (id > maxId) maxId = id;
                    }
                }

                const nextIdNum = maxId + 1;
                const nextId = `adr-${String(nextIdNum).padStart(3, '0')}`;
                const date = new Date().toISOString().split('T')[0];

                const slug = slugify(title, { lower: true, strict: true, trim: true });
                const fileName = `${nextId}-${slug}.md`;
                const filePath = path.join(decisionsPath, fileName);

                await safeWriteFile(filePath, createDecisionTemplate(nextId, date, title));

                console.log(chalk.green(`🧠 Decision recorded: .kontext/decisions/${fileName}`));

                // Update index.md last_updated
                const indexPath = path.join(kontextPath, 'index.md');
                if (await fs.pathExists(indexPath)) {
                    const content = await readFile(indexPath);
                    const parsed = matter(content);

                    parsed.data.last_updated = date;

                    // We need to reconstruct the file content carefully to preserve comments if possible, 
                    // but gray-matter stringify is usually destructive to custom formatting outside of front-matter.
                    // For now, we will use gray-matter stringify which re-writes the file.
                    // To preserve the content body, we use parsed.content.

                    const newContent = matter.stringify(parsed.content, parsed.data);
                    await overwriteFile(indexPath, newContent);
                    // console.log(chalk.gray('Updated index.md timestamp'));
                }

            } catch (error: any) {
                console.error(chalk.red('Failed to remember:'), error.message);
                process.exit(1);
            }
        });
};
