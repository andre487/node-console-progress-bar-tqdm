import {describe, test, expect} from '@jest/globals';
import {tqdm} from '../../src';

describe('Basic iteration', () => {
    test('Array', () => {
        const input = new Array(100).fill(null).map((_, idx) => idx);

        const res = Array.from(tqdm(input));

        expect(res).toEqual(input);
    });

    test('Generator', () => {
        const arr = new Array(100).fill(null).map((_, idx) => idx);

        function* gen() {
            for (const item of arr) {
                yield item;
            }
        }

        const res = Array.from(tqdm(gen()));

        expect(res).toEqual(arr);
    });

    test('Generic iterator', () => {
        const arr = new Array(100).fill(null).map((_, idx) => idx);

        class It {
            private _idx = 0;

            next(): IteratorResult<number, undefined> {
                if (this._idx == arr.length) {
                    return {value: undefined, done: true};
                }
                return {value: arr[this._idx++], done: false};
            }
        }

        const res = Array.from(tqdm(new It()));

        expect(res).toEqual(arr);
    });

    test('Number', () => {
        const res = Array.from(tqdm(100));
        const expected = new Array(100).fill(null);

        expect(res).toEqual(expected);
    });
});
