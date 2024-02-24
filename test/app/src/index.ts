import * as timers from 'node:timers/promises';
import {Tqdm, tqdm} from '../../../src';

async function main() {
    const data = new Array(100).fill(0).map((_, idx) => idx);

    function* gen() {
        for (const item of data) {
            yield item;
        }
    }

    async function someWork(time = 32) {
        await timers.setTimeout(time);
    }


    if (process.env.ENABLE_BIG == '1') {
        for (const _ of tqdm(123_431_123_000, {desc: 'BIG', progressSymbol: '=', unitScale: true})) {
            await someWork(0);
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let t: Tqdm<any> = tqdm(data, {
        desc: 'ARR',
        progressSymbol: '=',
        initial: 0,
        progressColor: 'red',
    });
    for (const _ of t) {
        await someWork();
    }

    t = tqdm(data, {
        desc: 'IND',
        progressSymbol: '&',
        initial: 30,
        progressColor: '$100',
    });
    for (const _ of t) {
        await someWork();
    }

    t = tqdm(100, {
        desc: 'NUM',
        progressColor: '#fcd3c2',
    });
    for (const _ of t) {
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
