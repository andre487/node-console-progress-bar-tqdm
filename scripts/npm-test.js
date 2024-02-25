const colors = require('colors/safe');
const cp = require('node:child_process');
const path = require('node:path');

process.chdir(path.join(__dirname, '..'));

let wereErrors = false;

function logTitle(title) {
    console.log(colors.cyan(title));
}

function run(title, cmd) {
    logTitle(title);
    try {
        cp.execSync(cmd, {stdio: 'inherit'});
    } catch (e) {
        wereErrors = true;
    }
}

run('==> Running type check', 'npm run type-check');
run('==> Running linters', 'npm run lint');
run('==> Running unit tests', 'npm run test:unit');

logTitle('==> Result');
if (wereErrors) {
    console.log(colors.red('FAILED: There were errors in tests'));
    process.exit(1);
}
console.log(colors.green('OK'));
