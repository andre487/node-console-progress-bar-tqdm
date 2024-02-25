const example = require('../lib/definition.cjs');
const {tqdm} = require('node-console-progress-bar-tqdm');
const timers = require('node:timers/promises');

module.exports = example({
    title: 'Basic example',
    description: 'Iterate over an array without any options',
    tags: ['CJS', 'Array', 'defaults'],
    async run() {
        const data = new Array(100).fill(null).map((_, idx) => idx);

        const res = [];
        for (const x of tqdm(data)) {
            res.push(x);
            await timers.setTimeout(16);
        }

        console.log('Result length:', res.length);
    },
});
