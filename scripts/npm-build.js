const fs = require('node:fs');
const path = require('node:path');
const {distDir, run, logTitle, cdToProj} = require('./common');

cdToProj();

logTitle('==> Cleanup');
for (const fileName of fs.readdirSync(distDir)) {
    if (fileName == '.gitignore') {
        continue;
    }
    console.log('Remove', fileName);
    const filePath = path.join(distDir, fileName);
    fs.rmSync(filePath, {recursive: true});
}

run('==> Build', 'npm run build:dist');
