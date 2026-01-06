import { Command } from 'commander';
import { registerInit } from './commands/init';
import { registerRemember } from './commands/remember';
import { registerValidate } from './commands/validate';
import { suggestCommand } from './commands/suggest';
import { registerSync } from './commands/sync';

const appPackage = require('../package.json');

const program = new Command();

program
    .name('kontext')
    .description('Manage project context state')
    .version(appPackage.version);

registerInit(program);
registerRemember(program);
registerValidate(program);
registerSync(program);
program.addCommand(suggestCommand);

program.parse(process.argv);
