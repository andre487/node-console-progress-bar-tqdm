import example from '../lib/definition.cjs';
import {
    tqdm,
    TqdmOptions,
    ITqdmSyncIteratorContainer,
    ITqdmAsyncIteratorContainer,
} from 'node-console-progress-bar-tqdm';
import * as timers from 'node:timers/promises';

type Item = {
    value: number;
    valueStr: string;
};

const total = 100;

function* genSync(): Generator<Item, undefined, undefined> {
    for (let i = 0; i < total; ++i) {
        yield {
            value: i,
            valueStr: i.toString(),
        };
    }
}

async function* genAsync(): AsyncGenerator<Item, undefined, undefined> {
    for (let i = 0; i < total; ++i) {
        yield {
            value: i,
            valueStr: i.toString(),
        };
    }
}

async function iterateSync(tq: ITqdmSyncIteratorContainer<Item>, ret: Item[] = []): Promise<Item[]> {
    await timers.setTimeout(8);
    const res = tq.nextSync();
    if (res.done) {
        return ret;
    }
    return iterateSync(tq, ret.concat(res.value));
}

async function iterateAsync(tq: ITqdmAsyncIteratorContainer<Item>, ret: Item[] = []): Promise<Item[]> {
    await timers.setTimeout(8);
    const res = await tq.nextAsync();
    if (res.done) {
        return ret;
    }
    return iterateAsync(tq, ret.concat(res.value));
}

export default example({
    title: 'Direct usage of Tqdm class',
    description: 'Very advanced example with direct Tqdm usage',
    tags: ['TS', 'Generator', 'AsyncGenerator', 'async', 'async/await', 'no loop', 'units', 'color', 'styling'],
    file: import.meta.url,
    async run() {
        const baseOpts: TqdmOptions = {
            total,
            unit: ['item', 'items'],
        };

        const optsSync: TqdmOptions = {
            ...baseOpts,
            progressSymbol: '%',
            progressBraces: ['[', ']'],
            progressColor: 'yellow',
            description: 'Sync iteration',
        };

        const tqSync = tqdm(genSync(), optsSync);
        await iterateSync(tqSync);

        const optsAsync: TqdmOptions = {
            ...baseOpts,
            progressSymbol: '#',
            progressBraces: ['{', '}'],
            progressColor: 'green',
            description: 'Async iteration',
        };

        const tqAsync = tqdm(genAsync(), optsAsync);
        await iterateAsync(tqAsync);
    },
});
