const colors = require('colors/safe');
const cm = require('./common');

cm.cdToProj();
let wereErrors = false;

cm.run('==> Running type check', 'npm run type-check') || (wereErrors = true);
cm.run('==> Running linters', 'npm run lint') || (wereErrors = true);
cm.run('==> Running unit tests', 'npm run test:unit') || (wereErrors = true);

cm.logTitle('==> Result');
if (wereErrors) {
    console.log(colors.red('FAILED: There were errors in tests'));
    process.exit(1);
}
console.log(colors.green('OK'));
