const colors = require('colors/safe');
const cp = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');

const projectDir = path.resolve(path.join(__dirname, '..'));
const distDir = path.join(projectDir, 'dist');
const distCjsDir = path.join(distDir, '_cjs');
const distEsmDir = path.join(distDir, '_esm');

function cdToProj() {
    process.chdir(path.join(__dirname, '..'));
}

function logTitle(title) {
    console.log(colors.cyan(title));
}

function run(title, cmd) {
    logTitle(title);
    try {
        cp.execSync(cmd, {stdio: 'inherit'});
    } catch (e) {
        return false;
    }
    return true;
}

function clearDistDir() {
    logTitle('==> Clear `dist` directory');
    if (fs.existsSync(distDir)) {
        fs.rmSync(distDir, {recursive: true});
    }
    fs.mkdirSync(distDir);
}

module.exports = {
    projectDir,
    distDir,
    distCjsDir,
    distEsmDir,
    cdToProj,
    logTitle,
    run,
    clearDistDir,
};
