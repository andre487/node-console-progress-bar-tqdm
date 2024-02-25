// @ts-ignore
import example from '../lib/definition.cjs';
import { tqdm } from 'node-console-progress-bar-tqdm';
import * as timers from 'node:timers/promises';
const total = 100;
function* gen() {
    for (let i = 0; i < total; ++i) {
        yield {
            value: i,
            valueStr: i.toString(),
        };
    }
}
export default example({
    title: 'Custom progress on TS',
    description: 'Fully customized progress bar written on TypeScript',
    async run() {
        const progress = tqdm(gen(), {
            total,
            description: 'Custom style',
            maxColWidth: 100,
            progressSymbol: '=',
            progressBraces: ['[', ']'],
            progressColor: '#f1f0c2',
            unit: ['thing', 'things'],
        });
        const res = [];
        for (const x of progress) {
            res.push(x);
            await timers.setTimeout(16);
        }
        console.log('Result length:', res.length);
    },
});
