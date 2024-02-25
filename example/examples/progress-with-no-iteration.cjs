const example = require('../lib/definition.cjs');
const {TqdmProgress} = require('node-console-progress-bar-tqdm');
const timers = require('node:timers/promises');

module.exports = example({
    title: 'Using progress bar directly',
    description: 'There is no iteration over tqdm iterator, direct TqdmProgress usage. Progress split to 2 parts',
    async run() {
        const total = 100;

        console.log('Showing first part of progress');
        const pb1 = new TqdmProgress({
            total,
            progressColor: '$128',
        });

        let prevVal = -1;
        for (let i = 0; i < total / 2; ++i) {
            pb1.update(i - prevVal);
            prevVal = i;
            await timers.setTimeout(32);
        }
        pb1.render(true);

        console.log('Showing second part of progress');
        const pb2 = new TqdmProgress({
            total,
            progressColor: '$151',
            initial: prevVal,
        });

        for (let i = prevVal; i < total; ++i) {
            // 1 by default
            pb2.update();
            await timers.setTimeout(32);
        }
        pb2.render(true);
    },
});
