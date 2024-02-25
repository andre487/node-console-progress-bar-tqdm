const example = require('../lib/definition.cjs');
const {tqdm} = require('node-console-progress-bar-tqdm');
const timers = require('node:timers/promises');

module.exports = example({
    title: 'Unit scaling, range iteration',
    description: 'Example with iteration over number range defined by `total` with unit scaling (k,M,G,T)',
    tags: ['CJS', 'units', 'unit scaling'],
    async run() {
        const res = [];
        /**
         * @type {TqdmOptions}
         */
        const opts = {
            description: 'Range iteration',
            unit: ['number', 'numbers'],
            unitScale: true,
        };

        for (const x of tqdm(10_000, opts)) {
            res.push(x);
            await timers.setTimeout(0);
        }

        console.log('Result length:', res.length);
    },
});
