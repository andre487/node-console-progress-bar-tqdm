import {tqdm} from 'node-console-progress-bar-tqdm';
import {default as example} from '../lib/definition.cjs';
import timers from 'node:timers/promises';

export default example({
    title: 'Countdown',
    description: 'Countdown, progress bar changes from full to empty',
    tags: ['ESM', 'Iterator', 'countdown'],
    file: import.meta.url,
    async run() {
        /**
         * @implements Iterator
         */
        class It {
            static total = 100;
            idx = 0;

            next() {
                const val = this.idx++;
                if (val >= It.total) {
                    return {done: true, value: undefined};
                }
                return {done: false, value: val};
            }
        }

        const opts = {
            description: 'Countdown',
            total: It.total,
            initial: It.total,
            step: -1,
        };
        const res = [];
        for (const x of tqdm(new It(), opts)) {
            res.push(x);
            await timers.setTimeout(16);
        }

        console.log('Result length:', res.length);
    },
});
