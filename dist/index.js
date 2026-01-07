"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const init_1 = require("./commands/init");
const remember_1 = require("./commands/remember");
const validate_1 = require("./commands/validate");
const suggest_1 = require("./commands/suggest");
const sync_1 = require("./commands/sync");
const format_1 = require("./commands/format");
const distill_1 = require("./commands/distill");
const appPackage = require('../package.json');
const program = new commander_1.Command();
program
    .name('kontext')
    .description('Manage project context state')
    .version(appPackage.version);
(0, init_1.registerInit)(program);
(0, remember_1.registerRemember)(program);
(0, validate_1.registerValidate)(program);
(0, sync_1.registerSync)(program);
(0, format_1.registerFormat)(program);
(0, distill_1.registerDistill)(program);
program.addCommand(suggest_1.suggestCommand);
program.parse(process.argv);
