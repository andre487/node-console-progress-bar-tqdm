import {beforeAll, describe, expect, test} from '@jest/globals';
import {Writable} from 'node:stream';
import {tqdm} from '../../src';

describe('Basic iteration', () => {
    let stream: NodeJS.WritableStream;

    beforeAll(() => {
        stream = new Writable({write() {}});
    });

    test('Async generator', async () => {
        const data = new Array(100).fill(null).map((_, idx) => idx);

        async function* gen() {
            for (const item of data) {
                yield item;
            }
        }

        const res: number[] = [];
        for await (const item of tqdm(gen(), {stream})) {
            res.push(item);
        }

        expect(res).toEqual(data);
    });

    test('Async iterator', async () => {
        const data = new Array(100).fill(null).map((_, idx) => idx);

        class AsyncIt {
            private _idx = 0;

            async next(): Promise<IteratorResult<number>> {
                if (this._idx == data.length) {
                    return {value: undefined, done: true};
                }
                return {value: data[this._idx++], done: false};
            }
        }

        const res: number[] = [];
        for await (const item of tqdm(new AsyncIt(), {stream})) {
            res.push(item);
        }

        expect(res).toEqual(data);
    });
});
