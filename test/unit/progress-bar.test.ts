import {beforeEach, describe, expect, test} from '@jest/globals';
import {EOL} from 'node:os';
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
            await sleep();
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

        const t = tqdm(gen(), {
            stream,
            unit: ['it', 'its'],
            forceTerminal: true,
        });
        for (const _ of t) {
            await sleep();
        }

        checkUncountableProgress(stream);
        expect(getCleanData(stream)[3]).toMatch(/\D\dits\s/);
    });

    test('Generator with total', async () => {
        const arr = new Array(10).fill(null).map((_, idx) => idx);

        function* gen() {
            for (const item of arr) {
                yield item;
            }
        }

        for (const _ of tqdm(gen(), {stream, forceTerminal: true, total: 10})) {
            await sleep();
        }

        checkCountableProgress(stream);
    });

    test('Number', async () => {
        for (const _ of tqdm(10, {stream, forceTerminal: true})) {
            await sleep();
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
            progressBraces: ['B', 'E'],
        });
        for (const _ of t) {
            await sleep();
        }

        let hasTimers = false;

        expect(stream.data).toHaveLength(23);
        const cleanData = getCleanData(stream);
        expect(cleanData).toHaveLength(12);

        expect(cleanData[0]).toBe(' TestBar:   0% B                                                        E  0/10 ');
        for (const line of cleanData.slice(1, 11)) {
            expect(line).toMatch(/^\s+TestBar:\s+\d+%\s*B=*\s*E\s+\d+\/\d+/);
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
            await sleep();
        }

        let hasTimers = false;

        expect(stream.data).toHaveLength(23);
        const cleanData = getCleanData(stream);
        expect(cleanData).toHaveLength(12);

        expect(cleanData[0]).toBe('  80% |====================================================             |  8/10 ');

        // Still `counter` <= `total`
        for (const line of cleanData.slice(1, 3)) {
            expect(line).toMatch(/^\s+\d+%\s*\|=*\s*\|\s+\d+\/\d+/);
            if (/.+\[\d{2}:\d{2}.\d{3}<\d{2}:\d{2}.\d{3}, \d+.\d{3}s\/it]/.test(line)) {
                hasTimers = true;
            }
        }

        if (!hasTimers) {
            console.error('There are no timers in data:', stream.data);
        }
        expect(hasTimers).toBeTruthy();

        // `counter` > `total`
        for (const line of cleanData.slice(3, 11)) {
            expect(line).toMatch(/^\s+\d+its?\s+\[\d{2}:\d{2}.\d{3}, \d+.\d{3}s\/it]/);
        }
    });

    test('Array with nCols', async () => {
        const input = new Array(10).fill(null).map((_, idx) => idx);

        const t = tqdm(input, {
            stream,
            forceTerminal: true,
            initial: 8,
            progressSymbol: '=',
            nCols: 70,
        });

        for (const _ of t) {
            await sleep();
        }

        const cleanData = getCleanData(stream);
        expect(cleanData).toHaveLength(12);
        expect(cleanData[0]).toBe('  80% |============================================           |  8/10 ');

        // With progress bar
        for (const line of cleanData.slice(1, 3)) {
            expect(line).toHaveLength(70);
        }

        // No progress bar
        for (const line of cleanData.slice(3, 10)) {
            expect(line).toHaveLength(29);
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

    expect(stream.data).toHaveLength(23);
    const cleanData = getCleanData(stream);
    expect(cleanData).toHaveLength(12);

    expect(cleanData[0]).toBe('   0% |                                                                 |  0/10 ');
    for (const line of cleanData.slice(1, 11)) {
        expect(line).toMatch(/^\s+\d+%\s*\|█*\s*\|\s+\d+\/\d+/);
        if (/.+\[\d{2}:\d{2}.\d{3}<\d{2}:\d{2}.\d{3}, \d+.\d{3}s\/it]/.test(line)) {
            hasTimers = true;
        }
    }

    if (!hasTimers) {
        console.error('There are no timers in data:', stream.data);
    }
    expect(hasTimers).toBeTruthy();

    expect(cleanData[11]).toBe(EOL);
}

function checkUncountableProgress(stream: TestStream) {
    let hasTimers = false;

    expect(stream.data).toHaveLength(23);
    const cleanData = getCleanData(stream);
    expect(cleanData).toHaveLength(12);

    expect(cleanData[0]).toBe(' 0its');
    for (const line of cleanData.slice(1, 11)) {
        expect(line).toMatch(/^ \d+its?/);
        if (/.+\[\d{2}:\d{2}.\d{3}, \d+.\d{3}s\/it]/.test(line)) {
            hasTimers = true;
        }
    }

    if (!hasTimers) {
        console.error('There are no timers in data:', stream.data);
    }
    expect(hasTimers).toBeTruthy();

    expect(cleanData[11]).toBe(EOL);
}


function getCleanData(stream: TestStream): string[] {
    return stream.data.filter((x) => x !== '\x1B[0G\x1B[K');
}

async function sleep(time = 5) {
    await timers.setTimeout(time);
}
