const cm = require('./common');
const fs = require('node:fs');
const path = require('node:path');

cm.cdToProj();
cm.clearDistDir();

cm.run('==> ESM: run tsc', 'tsc -p tsconfig.dist-esm.json');
cm.run('==> ESM: run tsc-alias', 'tsc-alias -p tsconfig.dist-esm.json');
cm.logTitle('==> ESM: add package.json');
fs.writeFileSync(path.join(cm.distEsmDir, 'package.json'), '{"type":"module"}');

cm.run('==> CJS: run tsc', 'tsc -p tsconfig.dist-cjs.json');
cm.logTitle('==> CJS: add package.json');
fs.writeFileSync(path.join(cm.distCjsDir, 'package.json'), '{"type":"commonjs"}');

cm.run('==> Build types', 'tsc -p tsconfig.dist-types.json');
