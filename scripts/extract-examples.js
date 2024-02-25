const fs = require('node:fs');
const path = require('node:path');
const {projectDir} = require('./common');

async function main() {
    const examples = await import('../example/examples/index.mjs');

    console.log('| File | Title | Description | Tags |');
    console.log('| ---- | ----- | ----------- | ---- |');
    for (const {title, description, tags, file} of examples.default) {
        const origFilePath = path.relative(projectDir, file.replace('file://', ''));
        let filePath = origFilePath.replace(/\.mjs$/, '.mts');
        if (!fs.existsSync(path.join(projectDir, filePath))) {
            filePath = origFilePath;
        }
        const baseName = path.basename(filePath);

        const tagString = tags.map((tag) => '`' + tag + '`').join(', ');
        console.log(
            `| [${baseName}](${filePath})`,
            `| ${title}`,
            `| ${description}`,
            `| ${tagString}`,
            '|',
        );
    }
}

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
