import * as timers from 'node:timers/promises';
import {tqdm} from '../../dist/_esm/index.js';

async function main() {
    const data = new Array(100).fill(0).map((_, idx) => idx);

    function* gen() {
        for (const item of data) {
            yield item;
        }
    }

    async function someWork() {
        await timers.setTimeout(50);
    }

    for (const _ of tqdm(data, {desc: 'ARR', progressSymbol: '=', initial: 30})) {
        await someWork();
    }

    for (const _ of tqdm(100, {desc: 'NUM'})) {
        await someWork();
    }

    for (const _ of tqdm(gen(), {desc: 'GEN', unit: ['thing', 'things']})) {
        await someWork();
    }
}

main().catch((e) => {
    console.error(e);
    process.exit(1);
});
