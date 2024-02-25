const example = require('../lib/definition.cjs');
const {tqdm} = require('node-console-progress-bar-tqdm');
const timers = require('node:timers/promises');

module.exports = example({
    title: 'Basic example',
    description: 'Iterate over an array with a few options',
    async run() {
        const data = new Array(100).fill(null).map((_, idx) => idx);

        const res = [];
        /**
         * @type {TqdmOptions}
         * These options can be omitted, tqdm has good defaults
         */
        const opts = {
            description: 'Basic example',
            unit: ['number', 'numbers'],
        };

        for (const x of tqdm(data, opts)) {
            res.push(x);
            await timers.setTimeout(16);
        }

        console.log('Result length:', res.length);
    },
});
