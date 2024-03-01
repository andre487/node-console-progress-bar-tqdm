const fs = require('node:fs');
const path = require('node:path');
const {projectDir} = require('./common');

async function main() {
    const examples = await import('../example/examples/index.mjs');

    console.log('| File | Title | Description | Tags |');
    console.log('| ---- | ----- | ----------- | ---- |');
    for (const {title, description, tags, file} of examples.default) {
        const normalizedFilePath = path
            .normalize(file.replace('file://', ''))
            .replace(/\\([A-Z]:\\)/, '$1'); // Windows fix

        const origFilePath = path.relative(projectDir, normalizedFilePath);
        let filePath = origFilePath.replace(/\.mjs$/, '.mts');
        if (!fs.existsSync(path.join(projectDir, filePath))) {
            filePath = origFilePath;
        }
        filePath = filePath.replace(/\\/g, '/');
        const baseName = path.basename(filePath);
        const fullUrl = `https://github.com/andre487/node-console-progress-bar-tqdm/blob/main/${filePath}`;

        const tagString = tags.map((tag) => '`' + tag + '`').join(', ');
        console.log(
            `| [${baseName}](${fullUrl})`,
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
