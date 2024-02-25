// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import example from '../lib/definition.cjs';
import {tqdm} from 'node-console-progress-bar-tqdm';
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

export default example({
    title: 'Custom progress on TS',
    description: 'Fully customized progress bar written on TypeScript',
    async run() {
        const progress = tqdm(gen(), {
            total,
            description: 'Custom styling',
            maxColWidth: 100,
            progressSymbol: '=',
            progressBraces: ['[', ']'],
            progressColor: '#f1f0c2',
            unit: ['thing', 'things'],
        });

        const res: Item[] = [];
        for (const x of progress) {
            res.push(x);
            await timers.setTimeout(16);
        }

        console.log('Result length:', res.length);
    },
});
