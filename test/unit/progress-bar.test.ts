import {beforeEach, describe, expect, test} from '@jest/globals';
import {EOL} from 'node:os';
import {Writable} from 'node:stream';
import * as timers from 'node:timers/promises';
import {tqdm, TqdmProgress} from '../../src';
import {getTermReturnToLineStart} from '../../src/term';

const commonOptions = {
    forceTerminal: true,
    minInterval: 0,
};

describe('TqdmProgress', () => {
    let stream: TestStream;

    beforeEach(() => {
        stream = new TestStream();
    });

    test('Array', async () => {
        const input = new Array(10).fill(null).map((_, idx) => idx);

        for (const _ of tqdm(input, {stream, ...commonOptions})) {
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
            ...commonOptions,
        });
        for (const _ of t) {
            await sleep();
        }

        checkUncountableProgress(stream);
        expect(getCleanData(stream)[3]).toMatch(/\D\dits\s/);
    });

    test('Async generator', async () => {
        const arr = new Array(10).fill(null).map((_, idx) => idx);

        async function* gen() {
            for (const item of arr) {
                yield item;
            }
        }

        const t = tqdm(gen(), {
            stream,
            unit: ['it', 'its'],
            ...commonOptions,
        });
        for await (const _ of t) {
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

        for (const _ of tqdm(gen(), {stream, total: 10, ...commonOptions})) {
            await sleep();
        }

        checkCountableProgress(stream);
    });

    test('Number', async () => {
        for (const _ of tqdm(10, {stream, ...commonOptions})) {
            await sleep();
        }
        checkCountableProgress(stream);
    });

    test('#withProgress()', () => {
        const total = 10;
        const res = TqdmProgress.withProgress((progressBar) => {
            const data = new Array(total).fill(null).map((_, idx) => idx);
            for (const _ of data) {
                progressBar.update();
            }
            return data;
        }, {total, stream, ...commonOptions});
        checkCountableProgress(stream, false);
        expect(res).toHaveLength(total);
    });

    test('#withAsyncProgress()', async () => {
        const total = 10;
        const res = await TqdmProgress.withAsyncProgress(async (progressBar) => {
            const data = new Array(total).fill(null).map((_, idx) => idx);
            for (const _ of data) {
                progressBar.update();
                await sleep();
            }
            return data;
        }, {total, stream, ...commonOptions});
        checkCountableProgress(stream);
        expect(res).toHaveLength(total);
    });

    test('Array with custom progress bar', async () => {
        const input = new Array(10).fill(null).map((_, idx) => idx);

        const t = tqdm(input, {
            stream,
            description: 'TestBar',
            unit: 't',
            progressSymbol: '=',
            progressBraces: ['B', 'E'],
            ...commonOptions,
        });
        for (const _ of t) {
            await sleep();
        }

        let hasTimers = false;

        expect(stream.data).toHaveLength(25);
        const cleanData = getCleanData(stream);
        expect(cleanData).toHaveLength(13);

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
            initial: 8,
            progressSymbol: '=',
            ...commonOptions,
        });

        for (const _ of t) {
            await sleep();
        }

        let hasTimers = false;

        expect(stream.data).toHaveLength(25);
        const cleanData = getCleanData(stream);
        expect(cleanData).toHaveLength(13);

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
        for (const line of cleanData.slice(3, 12)) {
            expect(line).toMatch(/^\s+\d+its?\s+\[\d{2}:\d{2}.\d{3}, \d+.\d{3}s\/it]/);
        }
    });

    test('Number with unit scaling', async () => {
        const t = tqdm(1_000, {
            stream,
            unitScale: true,
            progressSymbol: '=',
            ...commonOptions,
        });

        for (const _ of t) {
            await sleep(0);
        }

        expect(stream.data).toHaveLength(2005);
        const cleanData = getCleanData(stream);
        expect(cleanData).toHaveLength(1003);

        expect(cleanData[0]).toBe('   0% |                                                               | 0/1.00k ');
        for (const line of cleanData.slice(1, 1000)) {
            expect(line).toMatch(/^\s+\d+%\s*\|=*\s*\|\s+\d+\/[\d.]+k/);
        }
        expect(cleanData[1001]).toMatch(/^\s+\d+%\s*\|=*\s*\|\s+\d+\.\d+k\/[\d.]+k/);
    }, 30_000);

    test('Number with countdown', async () => {
        const t = tqdm(25, {
            initial: 25,
            step: -1,
            stream,
            progressSymbol: '=',
            ...commonOptions,
        });

        const res: number[] = [];
        for (const x of t) {
            await sleep(0);
            res.push(x);
        }

        expect(stream.data).toHaveLength(55);
        const cleanData = getCleanData(stream);
        expect(cleanData).toHaveLength(28);

        expect(cleanData[0]).toBe(' 100% |=================================================================| 25/25 ');
        for (const line of cleanData.slice(0, 26)) {
            expect(line).toMatch(/^\s+\d+%\s*\|=*\s*\|\s+\d+\/[\d.]/);
        }
        expect(cleanData[26]).toMatch(/\s+0%\s+\|\s+\|\s+0\/25\s+\[00:00.\d{3}<00:00\.000,\s+0\.001s\/it]\s+/);

        expect(res).toEqual(new Array(25).fill(null).map((_, idx) => idx));
    });

    test('Array with maxColWidth', async () => {
        const input = new Array(10).fill(null).map((_, idx) => idx);

        const t = tqdm(input, {
            stream,
            initial: 8,
            progressSymbol: '=',
            maxColWidth: 70,
            ...commonOptions,
        });

        for (const _ of t) {
            await sleep();
        }

        const cleanData = getCleanData(stream);
        expect(cleanData).toHaveLength(13);
        expect(cleanData[0]).toBe('  80% |============================================           |  8/10 ');

        // With progress bar
        for (const line of cleanData.slice(1, 3)) {
            expect(line).toHaveLength(70);
        }

        // No progress bar
        for (const line of cleanData.slice(3, 12)) {
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

function checkCountableProgress(stream: TestStream, checkTimers = true) {
    let hasTimers = false;

    expect(stream.data).toHaveLength(25);
    const cleanData = getCleanData(stream);
    expect(cleanData).toHaveLength(13);

    expect(cleanData[0]).toBe('   0% |                                                                 |  0/10 ');
    for (const line of cleanData.slice(1, 11)) {
        expect(line).toMatch(/^\s+\d+%\s*\|█*\s*\|\s+\d+\/\d+/);
        if (/.+\[\d{2}:\d{2}.\d{3}<\d{2}:\d{2}.\d{3}, \d+.\d{3}s\/it]/.test(line)) {
            hasTimers = true;
        }
    }

    if (!checkTimers) {
        return;
    }

    if (!hasTimers) {
        console.error('There are no timers in data:', stream.data);
    }
    expect(hasTimers).toBeTruthy();

    expect(cleanData[12]).toBe(EOL);
}

function checkUncountableProgress(stream: TestStream) {
    let hasTimers = false;

    expect(stream.data).toHaveLength(25);
    const cleanData = getCleanData(stream);
    expect(cleanData).toHaveLength(13);

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

    expect(cleanData[12]).toBe(EOL);
}


function getCleanData(stream: TestStream): string[] {
    return stream.data.filter((x) => x !== getTermReturnToLineStart());
}

async function sleep(time = 5) {
    await timers.setTimeout(time);
}
