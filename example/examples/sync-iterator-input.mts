import example from '../lib/definition.cjs';
import {tqdm, TqdmOptions} from 'node-console-progress-bar-tqdm';
import * as timers from 'node:timers/promises';

type Item = {
    value: number;
    valueStr: string;
};

class It implements Iterator<Item>, Iterable<Item> {
    public static readonly total = 250;
    private val = 0;

    [Symbol.iterator]() {
        return this;
    }

    next(): IteratorResult<Item> {
        const curVal = this.val++;
        const done = curVal >= It.total;
        return {
            done,
            value: {
                value: this.val,
                valueStr: this.val.toString(),
            },
        };
    }
}

export default example({
    title: 'Iteration over sync iterator',
    description: 'Example with Iterator and Iterable as input',
    tags: ['TS', 'Iterator', 'Iterable', 'color', 'styling'],
    file: import.meta.url,
    async run() {
        const opts: TqdmOptions = {
            total: It.total,
            description: 'Sync iterator',
            progressSymbol: '|',
            progressBraces: ['→', '←'],
            progressColor: 'magenta',
        };

        const res: Item[] = [];
        for (const x of tqdm(new It(), opts)) {
            res.push(x);
            await timers.setTimeout(8);
        }
        console.log('Result length:', res.length);
    },
});
