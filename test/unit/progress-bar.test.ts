import {beforeEach, describe, expect, test} from '@jest/globals';
import {Writable} from 'node:stream';
import * as timers from 'node:timers/promises';
import {tqdm} from '../../src';

describe('TqdmProgress', () => {
    let stream: TestStream;

    beforeEach(() => {
        stream = new TestStream();
    });

    test('Array', async () => {
        const input = new Array(10).fill(null).map((_, idx) => idx);

        for (const _ of tqdm(input, {stream, forceTerminal: true})) {
            await timers.setTimeout(5);
        }

        checkCountableProgress(stream);
    });

    test('Generator', async () => {
        const arr = new Array(10).fill(null).map((_, idx) => idx);

        function* gen() {
            for (const item of arr) {
                yield item;
            }
        }

        for (const _ of tqdm(gen(), {stream, forceTerminal: true})) {
            await timers.setTimeout(5);
        }

        checkUncountableProgress(stream);
    });

    test('Generator with total', async () => {
        const arr = new Array(10).fill(null).map((_, idx) => idx);

        function* gen() {
            for (const item of arr) {
                yield item;
            }
        }

        for (const _ of tqdm(gen(), {stream, forceTerminal: true, total: 10})) {
            await timers.setTimeout(5);
        }

        checkCountableProgress(stream);
    });

    test('Number', async () => {
        for (const _ of tqdm(10, {stream, forceTerminal: true})) {
            await timers.setTimeout(5);
        }
        checkCountableProgress(stream);
    });

    test('Array with options', async () => {
        const input = new Array(10).fill(null).map((_, idx) => idx);

        const t = tqdm(input, {
            stream,
            forceTerminal: true,
            desc: 'TestBar',
            unit: 't',
            progressSymbol: '=',
        });
        for (const _ of t) {
            await timers.setTimeout(5);
        }

        let hasTimers = false;

        expect(stream.data).toHaveLength(12);
        expect(stream.data[0]).toBe('\x1B[0G TestBar:   0% |                                        |  0/10 ');
        for (const line of stream.data.slice(1, 11)) {
            expect(line).toMatch(/^\x1B\[0G\s+TestBar:\s+\d+%\s*\|=*\s*\|\s+\d+\/\d+/);
            if (/.+\[\d{2}:\d{2}.\d{3}<\d{2}:\d{2}.\d{3}, \d+.\d{3}s\/t]/.test(line)) {
                hasTimers = true;
            }
        }

        if (!hasTimers) {
            console.error('There are no timers in data:', stream.data);
        }
        expect(hasTimers).toBeTruthy();
    });
});

class TestStream extends Writable {
    private _data: string[] = [];

    get data(): string[] {
        return this._data;
    }

    write(chunk: string): boolean {
        this._data.push(chunk.toString());
        return true;
    }
}

function checkCountableProgress(stream: TestStream) {
    let hasTimers = false;

    expect(stream.data).toHaveLength(12);
    expect(stream.data[0]).toBe('\x1B[0G   0% |                                                 |  0/10 ');
    for (const line of stream.data.slice(1, 11)) {
        expect(line).toMatch(/^\x1B\[0G\s+\d+%\s*\|█*\s*\|\s+\d+\/\d+/);
        if (/.+\[\d{2}:\d{2}.\d{3}<\d{2}:\d{2}.\d{3}, \d+.\d{3}s\/it]/.test(line)) {
            hasTimers = true;
        }
    }

    if (!hasTimers) {
        console.error('There are no timers in data:', stream.data);
    }
    expect(hasTimers).toBeTruthy();
}


function checkUncountableProgress(stream: TestStream) {
    let hasTimers = false;

    expect(stream.data).toHaveLength(12);
    expect(stream.data[0]).toBe('\x1B[0G 0it');
    for (const line of stream.data.slice(1, 11)) {
        expect(line).toMatch(/^\x1B\[0G \d+it/);
        if (/.+\[\d{2}:\d{2}.\d{3}, \d+.\d{3}s\/it]/.test(line)) {
            hasTimers = true;
        }
    }

    if (!hasTimers) {
        console.error('There are no timers in data:', stream.data);
    }
    expect(hasTimers).toBeTruthy();
}
