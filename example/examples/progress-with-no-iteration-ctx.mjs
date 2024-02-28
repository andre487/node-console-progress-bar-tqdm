import example from '../lib/definition.cjs';
import { TqdmProgress } from 'node-console-progress-bar-tqdm';
import * as timers from 'node:timers/promises';
export default example({
    title: 'Using progress bar through context helpers',
    description: 'There is no tqdm function, using withProgress and withAsyncProgress helpers',
    tags: ['TS', 'TqdmProgress', 'withProgress', 'withAsyncProgress', 'no tqdm()', 'color', 'styling', 'emoji'],
    file: import.meta.url,
    async run() {
        const data = new Array(100).fill(null).map((_, idx) => idx);
        const baseOptions = {
            total: data.length,
            progressBraces: ['🖱️', '⌨️'],
            progressSymbol: '→',
        };
        const syncOptions = {
            ...baseOptions,
            description: 'TqdmProgress.withProgress',
            progressColor: '$128',
        };
        const syncRes = TqdmProgress.withProgress((progressBar) => {
            let res = 0;
            for (const x of data) {
                res += x;
                // some useless work to slow down a synchronous process
                for (let i = 0; i < 10000; ++i) {
                    process.stderr.write('');
                }
                progressBar.update();
            }
            return res;
        }, syncOptions);
        console.log('Data summ from sync iteration:', syncRes);
        const asyncOptions = {
            ...baseOptions,
            description: 'TqdmProgress.withAsyncProgress',
            progressColor: '$213',
        };
        async function* asyncGen() {
            for (const x of data) {
                yield x;
            }
        }
        const asyncRes = await TqdmProgress.withAsyncProgress(async (progressBar) => {
            let res = 0;
            for await (const x of asyncGen()) {
                res += x;
                await timers.setTimeout(18);
                progressBar.update();
            }
            return res;
        }, asyncOptions);
        console.log('Data summ from async iteration:', asyncRes);
    },
});
