import example from '../lib/definition.cjs';
import { tqdm } from 'node-console-progress-bar-tqdm';
import * as timers from 'node:timers/promises';
class It {
    static total = 250;
    val = 0;
    [Symbol.asyncIterator]() {
        return this;
    }
    async next() {
        const curVal = this.val++;
        const done = curVal >= It.total;
        return {
            done,
            value: {
                value: this.val,
                valueStr: this.val.toString(),
            }
        };
    }
}
export default example({
    title: 'Iteration over async iterator',
    description: 'Example with AsyncIterator and AsyncIterable as input',
    async run() {
        const opts = {
            total: It.total,
            description: 'Async iterator',
            progressSymbol: '|',
            progressBraces: ['→', '←'],
            progressColor: 'cyan',
        };
        const res = [];
        for await (const x of tqdm(new It(), opts)) {
            res.push(x);
            await timers.setTimeout(8);
        }
        console.log('Result length:', res.length);
    },
});
