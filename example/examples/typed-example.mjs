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
async function iterate(tq) {
    const res = [];
    for (const x of tq) {
        res.push(x);
        await timers.setTimeout(16);
    }
    return res;
}
export default example({
    title: 'Custom progress style',
    description: 'Fully customized progress bar written on TypeScript',
    async run() {
        const opts = {
            total,
            description: 'Custom styling',
            maxColWidth: 100,
            progressSymbol: '=',
            progressBraces: ['[', ']'],
            progressColor: '#f1f0c2',
            unit: ['thing', 'things'],
        };
        const inp = gen();
        const tq = tqdm(inp, opts);
        const res = await iterate(tq);
        console.log('Result length:', res.length);
    },
});
