import {tqdm} from 'node-console-progress-bar-tqdm';
import {default as example} from '../lib/definition.cjs';
import timers from 'node:timers/promises';

export default example({
    title: 'Generator examples',
    description: 'A couple of examples where we iterate over generator',
    async run() {
        const total = 100;

        function* gen() {
            for (let i = 0; i < total; ++i) {
                yield i;
            }
        }

        const res = [];
        // In this example, we don't have a progress bar because we don't have
        // a total number of elements
        for (const x of tqdm(gen(), {description: 'Generator without `total`'})) {
            res.push(x);
            await timers.setTimeout(16);
        }

        // In this example, we have a progress bar because we suggest
        // a total number of elements
        for (const x of tqdm(gen(), {description: 'Generator with total', total})) {
            res.push(x);
            await timers.setTimeout(16);
        }

        console.log('Result length:', res.length);
    },
});
