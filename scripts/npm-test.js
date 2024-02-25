const colors = require('colors/safe');
const {run, logTitle, cdToProj} = require('./common');

cdToProj();
let wereErrors = false;

run('==> Running type check', 'npm run type-check') || (wereErrors = true);
run('==> Running linters', 'npm run lint') || (wereErrors = true);
run('==> Running unit tests', 'npm run test:unit') || (wereErrors = true);

logTitle('==> Result');
if (wereErrors) {
    console.log(colors.red('FAILED: There were errors in tests'));
    process.exit(1);
}
console.log(colors.green('OK'));
