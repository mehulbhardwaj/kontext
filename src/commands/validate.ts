import { Command } from 'commander';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import matter from 'gray-matter';
import { IndexSchema, DecisionSchema } from '../lib/schemas';

export const registerValidate = (program: Command) => {
    program
        .command('validate')
        .description('Validate the integrity of kontext')
        .action(async () => {
            try {
                const cwd = process.cwd();
                const kontextPath = path.join(cwd, '.kontext');

                if (!(await fs.pathExists(kontextPath))) {
                    console.error(chalk.red('Kontext directory not found.'));
                    process.exit(1);
                }

                let hasError = false;
                let fileCount = 0;
                let decisionCount = 0;

                // validate index.md
                const indexPath = path.join(kontextPath, 'index.md');
                if (await fs.pathExists(indexPath)) {
                    fileCount++;
                    const content = await fs.readFile(indexPath, 'utf-8');
                    const parsed = matter(content);
                    const result = IndexSchema.safeParse(parsed.data);
                    if (!result.success) {
                        console.error(chalk.red(`❌ index.md invalid:`));
                        console.error(result.error.issues);
                        hasError = true;
                    }
                } else {
                    console.error(chalk.red(`❌ index.md missing`));
                    hasError = true;
                }

                // validate decisions
                const decisionsPath = path.join(kontextPath, 'decisions');
                if (await fs.pathExists(decisionsPath)) {
                    const files = await fs.readdir(decisionsPath);
                    for (const file of files) {
                        if (!file.endsWith('.md')) continue;
                        fileCount++;
                        decisionCount++;

                        const content = await fs.readFile(path.join(decisionsPath, file), 'utf-8');
                        const parsed = matter(content);

                        // Check if filename matches ID
                        const match = file.match(/^(adr-\d{3})/);
                        if (!match) {
                            console.error(chalk.red(`❌ Invalid filename format: ${file}`));
                            hasError = true;
                            continue;
                        }
                        const fileId = match[1];

                        const result = DecisionSchema.safeParse(parsed.data);
                        if (!result.success) {
                            console.error(chalk.red(`❌ ${file} invalid:`));
                            console.error(result.error.issues);
                            hasError = true;
                        } else {
                            if (result.data.id !== fileId) {
                                console.error(chalk.red(`❌ ${file} validation error: ID in front-matter (${result.data.id}) does not match filename (${fileId})`));
                                hasError = true;
                            }
                        }
                    }
                }

                if (hasError) {
                    console.log(chalk.red('\nValidation failed.'));
                    process.exit(1);
                } else {
                    console.log(chalk.green(`\n✅ State is valid. (${fileCount} files, ${decisionCount} decisions)`));
                }

            } catch (error: any) {
                console.error(chalk.red('Validation failed with error:'), error.message);
                process.exit(1);
            }
        });
};
