"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commander_1 = require("commander");
const init_1 = require("./commands/init");
const remember_1 = require("./commands/remember");
const validate_1 = require("./commands/validate");
const suggest_1 = require("./commands/suggest");
const appPackage = require('../package.json');
const program = new commander_1.Command();
program
    .name('kontext')
    .description('Manage project context state')
    .version(appPackage.version);
(0, init_1.registerInit)(program);
(0, remember_1.registerRemember)(program);
(0, validate_1.registerValidate)(program);
program.addCommand(suggest_1.suggestCommand);
program.parse(process.argv);
