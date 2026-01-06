import fs from 'fs-extra';
import path from 'path';

export const ensureKontextDir = async (cwd: string) => {
    const kontextPath = path.join(cwd, '.kontext');
    const decisionsPath = path.join(kontextPath, 'decisions');

    await fs.ensureDir(kontextPath);
    await fs.ensureDir(decisionsPath);

    return { kontextPath, decisionsPath };
};

export const safeWriteFile = async (filePath: string, content: string) => {
    if (await fs.pathExists(filePath)) {
        throw new Error(`File already exists: ${filePath}`);
    }
    await fs.writeFile(filePath, content, 'utf-8');
};

export const overwriteFile = async (filePath: string, content: string) => {
    await fs.writeFile(filePath, content, 'utf-8');
};

export const appendToFile = async (filePath: string, content: string) => {
    await fs.appendFile(filePath, content, 'utf-8');
};

export const readFile = async (filePath: string) => {
    return fs.readFile(filePath, 'utf-8');
};

export const listFiles = async (dirPath: string) => {
    return fs.readdir(dirPath);
};
