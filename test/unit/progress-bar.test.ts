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
        expect(stream.data[0]).toBe('\x1B[0G\x1B[K TestBar:   0% |                                        |  0/10 ');
        for (const line of stream.data.slice(1, 11)) {
            expect(line).toMatch(/^\x1B\[0G\x1B\[K\s+TestBar:\s+\d+%\s*\|=*\s*\|\s+\d+\/\d+/);
            if (/.+\[\d{2}:\d{2}.\d{3}<\d{2}:\d{2}.\d{3}, \d+.\d{3}s\/t]/.test(line)) {
                hasTimers = true;
            }
        }

        if (!hasTimers) {
            console.error('There are no timers in data:', stream.data);
        }
        expect(hasTimers).toBeTruthy();
    });

    test('Array with initial', async () => {
        const input = new Array(10).fill(null).map((_, idx) => idx);

        const t = tqdm(input, {
            stream,
            forceTerminal: true,
            initial: 8,
            progressSymbol: '=',
        });

        for (const _ of t) {
            await timers.setTimeout(5);
        }

        let hasTimers = false;

        expect(stream.data).toHaveLength(12);
        expect(stream.data[0]).toBe('\x1B[0G\x1B[K  80% |=======================================          |  8/10 ');

        // Still `counter` <= `total`
        for (const line of stream.data.slice(1, 3)) {
            expect(line).toMatch(/^\x1B\[0G\x1B\[K\s+\d+%\s*\|=*\s*\|\s+\d+\/\d+/);
            if (/.+\[\d{2}:\d{2}.\d{3}<\d{2}:\d{2}.\d{3}, \d+.\d{3}s\/it]/.test(line)) {
                hasTimers = true;
            }
        }

        if (!hasTimers) {
            console.error('There are no timers in data:', stream.data);
        }
        expect(hasTimers).toBeTruthy();

        // `counter` > `total`
        for (const line of stream.data.slice(3, 11)) {
            expect(line).toMatch(/^\x1B\[0G\x1B\[K\s+\d+it\s+\[\d{2}:\d{2}.\d{3}, \d+.\d{3}s\/it]/);
        }
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
    expect(stream.data[0]).toBe('\x1B[0G\x1B[K   0% |                                                 |  0/10 ');
    for (const line of stream.data.slice(1, 11)) {
        expect(line).toMatch(/^\x1B\[0G\x1B\[K\s+\d+%\s*\|█*\s*\|\s+\d+\/\d+/);
        if (/.+\[\d{2}:\d{2}.\d{3}<\d{2}:\d{2}.\d{3}, \d+.\d{3}s\/it]/.test(line)) {
            hasTimers = true;
        }
    }

    if (!hasTimers) {
        console.error('There are no timers in data:', stream.data);
    }
    expect(hasTimers).toBeTruthy();

    expect(stream.data[11]).toBe('\n');
}


function checkUncountableProgress(stream: TestStream) {
    let hasTimers = false;

    expect(stream.data).toHaveLength(12);
    expect(stream.data[0]).toBe('\x1B[0G\x1B[K 0it');
    for (const line of stream.data.slice(1, 11)) {
        expect(line).toMatch(/^\x1B\[0G\x1B\[K \d+it/);
        if (/.+\[\d{2}:\d{2}.\d{3}, \d+.\d{3}s\/it]/.test(line)) {
            hasTimers = true;
        }
    }

    if (!hasTimers) {
        console.error('There are no timers in data:', stream.data);
    }
    expect(hasTimers).toBeTruthy();

    expect(stream.data[11]).toBe('\n');
}
