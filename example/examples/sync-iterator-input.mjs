import example from '../lib/definition.cjs';
import { tqdm } from 'node-console-progress-bar-tqdm';
import * as timers from 'node:timers/promises';
class It {
    static total = 250;
    val = 0;
    [Symbol.iterator]() {
        return this;
    }
    next() {
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
    async run() {
        const opts = {
            total: It.total,
            description: 'Sync iterator',
            progressSymbol: '|',
            progressBraces: ['→', '←'],
            progressColor: 'magenta',
        };
        const res = [];
        for (const x of tqdm(new It(), opts)) {
            res.push(x);
            await timers.setTimeout(8);
        }
        console.log('Result length:', res.length);
    },
});
