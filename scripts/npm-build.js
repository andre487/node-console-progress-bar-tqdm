const {distDir, run, cdToProj, clearDir, logTitle, distEsmDir, distCjsDir} = require('./common');
const fs = require('node:fs');
const path = require('node:path');

cdToProj();
clearDir(distDir);

run('==> ESM: run tsc', 'tsc -p tsconfig.dist-esm.json');
run('==> ESM: run tsc-alias', 'tsc-alias -p tsconfig.dist-esm.json');
logTitle('==> ESM: add package.json');
fs.writeFileSync(path.join(distEsmDir, 'package.json'), '{"type":"module"}');

run('==> CJS: run tsc', 'tsc -p tsconfig.dist-cjs.json');
logTitle('==> CJS: add package.json');
fs.writeFileSync(path.join(distCjsDir, 'package.json'), '{"type":"commonjs"}');

run('==> Build types', 'tsc -p tsconfig.dist-types.json');
