const colors = require('colors/safe');
const cp = require('node:child_process');
const path = require('node:path');

const projectDir = path.resolve(path.join(__dirname, '..'));
const distDir = path.join(projectDir, 'dist');

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

module.exports = {
    projectDir,
    distDir,
    cdToProj,
    logTitle,
    run,
};
