"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFiles = exports.readFile = exports.appendToFile = exports.overwriteFile = exports.safeWriteFile = exports.ensureKontextDir = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const ensureKontextDir = async (cwd) => {
    const kontextPath = path_1.default.join(cwd, '.kontext');
    const decisionsPath = path_1.default.join(kontextPath, 'decisions');
    await fs_extra_1.default.ensureDir(kontextPath);
    await fs_extra_1.default.ensureDir(decisionsPath);
    return { kontextPath, decisionsPath };
};
exports.ensureKontextDir = ensureKontextDir;
const safeWriteFile = async (filePath, content) => {
    if (await fs_extra_1.default.pathExists(filePath)) {
        throw new Error(`File already exists: ${filePath}`);
    }
    await fs_extra_1.default.writeFile(filePath, content, 'utf-8');
};
exports.safeWriteFile = safeWriteFile;
const overwriteFile = async (filePath, content) => {
    await fs_extra_1.default.writeFile(filePath, content, 'utf-8');
};
exports.overwriteFile = overwriteFile;
const appendToFile = async (filePath, content) => {
    await fs_extra_1.default.appendFile(filePath, content, 'utf-8');
};
exports.appendToFile = appendToFile;
const readFile = async (filePath) => {
    return fs_extra_1.default.readFile(filePath, 'utf-8');
};
exports.readFile = readFile;
const listFiles = async (dirPath) => {
    return fs_extra_1.default.readdir(dirPath);
};
exports.listFiles = listFiles;
