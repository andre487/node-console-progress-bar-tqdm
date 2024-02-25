import example from '../lib/definition.cjs';
import { tqdm, } from 'node-console-progress-bar-tqdm';
import * as timers from 'node:timers/promises';
const total = 100;
function* genSync() {
    for (let i = 0; i < total; ++i) {
        yield {
            value: i,
            valueStr: i.toString(),
        };
    }
}
async function* genAsync() {
    for (let i = 0; i < total; ++i) {
        yield {
            value: i,
            valueStr: i.toString(),
        };
    }
}
async function iterateSync(tq, ret = []) {
    await timers.setTimeout(8);
    const res = tq.nextSync();
    if (res.done) {
        return ret;
    }
    return iterateSync(tq, ret.concat(res.value));
}
async function iterateAsync(tq, ret = []) {
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
    tags: ['TS', 'async', 'async/await', 'Generator', 'AsyncGenerator', 'no loop', 'units', 'color', 'styling'],
    file: import.meta.url,
    async run() {
        const baseOpts = {
            total,
            unit: ['item', 'items'],
        };
        const optsSync = {
            ...baseOpts,
            progressSymbol: '%',
            progressBraces: ['[', ']'],
            progressColor: 'yellow',
            description: 'Sync iteration',
        };
        const tqSync = tqdm(genSync(), optsSync);
        await iterateSync(tqSync);
        const optsAsync = {
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
