import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import path from 'path';
import fs from 'fs-extra';
import { ensureKontextDir, safeWriteFile, appendToFile } from '../lib/fs';
import {
    createIndexTemplate,
    createArchitectureTemplate,
    createConstraintsTemplate,
    createSetupTemplate
} from '../lib/templates';

export const registerInit = (program: Command) => {
    program
        .command('init')
        .description('Initialize kontext memory in the current repository')
        .action(async () => {
            console.log(chalk.blue('Initializing Kontext...'));

            const cwd = process.cwd();
            const projectPackageJson = path.join(cwd, 'package.json');
            let projectName = 'My Project';

            if (await fs.pathExists(projectPackageJson)) {
                try {
                    const pkg = await fs.readJson(projectPackageJson);
                    if (pkg.name) projectName = pkg.name;
                } catch (e) {
                    // ignore
                }
            }

            try {
                const { kontextPath, decisionsPath } = await ensureKontextDir(cwd);

                // Create default files
                const today = new Date().toISOString().split('T')[0];

                // We use try/catch for safeWriteFile to warn if exists, but not fail entirely
                try {
                    await safeWriteFile(path.join(kontextPath, 'index.md'), createIndexTemplate(today, projectName));
                    console.log(chalk.green('Created kontext/index.md'));
                } catch (e: any) {
                    console.log(chalk.yellow(`Skipped index.md: ${e.message}`));
                }

                try {
                    await safeWriteFile(path.join(kontextPath, 'architecture.md'), createArchitectureTemplate());
                    console.log(chalk.green('Created kontext/architecture.md'));
                } catch (e: any) {
                    console.log(chalk.yellow(`Skipped architecture.md: ${e.message}`));
                }

                try {
                    await safeWriteFile(path.join(kontextPath, 'constraints.md'), createConstraintsTemplate());
                    console.log(chalk.green('Created kontext/constraints.md'));
                } catch (e: any) {
                    console.log(chalk.yellow(`Skipped constraints.md: ${e.message}`));
                }

                try {
                    await safeWriteFile(path.join(kontextPath, 'setup.md'), createSetupTemplate());
                    console.log(chalk.green('Created kontext/setup.md'));
                } catch (e: any) {
                    console.log(chalk.yellow(`Skipped setup.md: ${e.message}`));
                }

                // Context Bridge
                await handleContextBridge(cwd);

                console.log(chalk.bold.green('\n✅ Kontext initialized.'));
                console.log(`👉 Run ${chalk.cyan('kontext suggest')} to analyze your code.`);

            } catch (error: any) {
                console.error(chalk.red('Failed to initialize:'), error.message);
                process.exit(1);
            }
        });
};

async function handleContextBridge(cwd: string) {
    const contextFiles = ['.cursorrules', '.windsurfrules'];
    const foundFiles = [];

    for (const file of contextFiles) {
        if (await fs.pathExists(path.join(cwd, file))) {
            foundFiles.push(file);
        }
    }

    if (foundFiles.length === 0) return;

    const { addToContext } = await inquirer.prompt([
        {
            type: 'confirm',
            name: 'addToContext',
            message: `Found ${foundFiles.join(', ')}. Add Kontext instructions to them?`,
            default: true
        }
    ]);

    if (addToContext) {
        const instructionBlock = `\n\n# Kontext Memory
This project uses Kontext for architectural decisions.
- Read .kontext/index.md for context.
- Check .kontext/decisions/ for history.
`;

        for (const file of foundFiles) {
            await appendToFile(path.join(cwd, file), instructionBlock);
            console.log(chalk.green(`Updated ${file}`));
        }
    }
}
