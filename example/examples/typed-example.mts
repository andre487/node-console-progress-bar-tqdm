import example from '../lib/definition.cjs';
import {tqdm, TqdmOptions, Tqdm, TqdmInput} from 'node-console-progress-bar-tqdm';
import * as timers from 'node:timers/promises';

type Item = {
    value: number;
    valueStr: string;
};

const total = 100;

function* gen(): Generator<Item, undefined, undefined> {
    for (let i = 0; i < total; ++i) {
        yield {
            value: i,
            valueStr: i.toString(),
        };
    }
}

async function iterate(tq: Tqdm<Generator<Item>>): Promise<Item[]> {
    const res: Item[] = [];
    for (const x of tq) {
        res.push(x);
        await timers.setTimeout(16);
    }
    return res;
}

export default example({
    title: 'Custom progress on TS',
    description: 'Fully customized progress bar written on TypeScript',
    async run() {
        const opts: TqdmOptions = {
            total,
            description: 'Custom styling',
            maxColWidth: 100,
            progressSymbol: '=',
            progressBraces: ['[', ']'],
            progressColor: '#f1f0c2',
            unit: ['thing', 'things'],
        };
        const inp: TqdmInput = gen();
        const tq = tqdm(inp, opts);
        const res = await iterate(tq);
        console.log('Result length:', res.length);
    },
});
