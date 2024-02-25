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
    console.log(colors.green(title));
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

function clearDir(dir, verbose = false) {
    logTitle('==> Clear directory');
    for (const fileName of fs.readdirSync(dir)) {
        if (fileName == '.gitignore') {
            continue;
        }
        if (verbose) {
            console.log('Remove', fileName);
        }
        const filePath = path.join(dir, fileName);
        fs.rmSync(filePath, {recursive: true});
    }
}

module.exports = {
    projectDir,
    distDir,
    distCjsDir,
    distEsmDir,
    cdToProj,
    logTitle,
    run,
    clearDir,
};
