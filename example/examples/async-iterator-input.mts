import example from '../lib/definition.cjs';
import {tqdm, TqdmOptions} from 'node-console-progress-bar-tqdm';
import * as timers from 'node:timers/promises';

type Item = {
    value: number;
    valueStr: string;
};

class It implements AsyncIterator<Item>, AsyncIterable<Item> {
    public static readonly total = 250;
    private val = 0;

    [Symbol.asyncIterator]() {
        return this;
    }

    async next(): Promise<IteratorResult<Item>> {
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
    title: 'Iteration over async iterator',
    description: 'Example with AsyncIterator and AsyncIterable as input',
    tags: ['TS', 'AsyncIterable', 'async', 'for/await', 'color', 'styling'],
    file: import.meta.url,
    async run() {
        const opts: TqdmOptions = {
            total: It.total,
            description: 'Async iterator',
            progressSymbol: '|',
            progressBraces: ['→', '←'],
            progressColor: 'cyan',
        };

        const res: Item[] = [];
        for await (const x of tqdm(new It(), opts)) {
            res.push(x);
            await timers.setTimeout(8);
        }
        console.log('Result length:', res.length);
    },
});
