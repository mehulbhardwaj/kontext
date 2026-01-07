import { Command } from 'commander';
import { registerInit } from './commands/init';
import { registerRemember } from './commands/remember';
import { registerValidate } from './commands/validate';
import { suggestCommand } from './commands/suggest';
import { registerSync } from './commands/sync';
import { registerFormat } from './commands/format';
import { registerDistill } from './commands/distill';

const appPackage = require('../package.json');

const program = new Command();

program
    .name('kontext')
    .description('Project Memory Primitive')
    .version(appPackage.version);

registerInit(program);
registerRemember(program);
registerValidate(program);
registerSync(program);
registerFormat(program);
registerDistill(program);
program.addCommand(suggestCommand);

program.parse(process.argv);
