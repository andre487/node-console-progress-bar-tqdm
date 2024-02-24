import {TqdmInnerIterator, TqdmInput, TqdmItem, TqdmIteratorResult, TqdmOptions} from './base-types';
import {formatTimeDelta, hasLength, isIterable, isIterator} from './utils';

const defaultTerminalColumns = 64;

const defaultOptions: Required<TqdmOptions> = {
    desc: '',
    progressSymbol: '█',
    unit: 'it',
    initial: 0,
    total: -1,
    stream: process.stderr,
    forceTerminal: false,
};

export class TqdmProgress {
    private readonly ctrlPrefix: string;
    private readonly desc: string;
    private readonly unit: string;
    private readonly progressSymbol: string;
    private readonly stream: NodeJS.WritableStream;
    private readonly streamIsTerminal: boolean;
    private readonly forceTerminal: boolean;

    private readonly total: number;
    private readonly totalDigits: number = 0;
    private readonly haveCorrectTotal: boolean;

    private readonly startTime: number;
    private timeSpent: number = 0;
    private counter: number;

    constructor(options: TqdmOptions) {
        const fullOptions = {
            ...defaultOptions,
            ...options,
        };
        this.desc = fullOptions.desc;
        this.unit = fullOptions.unit;
        this.progressSymbol = fullOptions.progressSymbol;
        this.stream = fullOptions.stream;

        this.forceTerminal = fullOptions.forceTerminal;
        if (this.forceTerminal) {
            this.streamIsTerminal = true;
        } else {
            this.streamIsTerminal = this.stream === process.stderr || this.stream === process.stdout;
        }

        // ANSI/VT100 codes: https://bash-hackers.gabe565.com/scripting/terminalcodes/
        // \x1b – ESC, ^[: Start an escape sequence.
        // \x1b[ – ESC + [.
        // 0G – Move cursor to the 0th column of the current row.
        // K – Clear string from the cursor position to the end of line.
        this.ctrlPrefix = this.streamIsTerminal ? '\x1b[0G\x1b[K' : '';

        this.counter = fullOptions.initial;
        this.total = fullOptions.total;
        this.haveCorrectTotal = isFinite(this.total) && !isNaN(this.total) && this.total > 0;
        if (this.haveCorrectTotal) {
            this.totalDigits = Math.trunc(Math.log10(this.total)) + 1;
        }

        this.startTime = Date.now();
    }

    update(by: number = 1) {
        this.counter += by;
        this.timeSpent = Date.now() - this.startTime;
        this.render();
    }

    render() {
        const left = this.generateLeft();
        const right = this.generateRight();
        const progressBar = this.generateProgressBar(left.length + right.length);
        this.stream.write(`${this.ctrlPrefix}${left}${progressBar}${right}`);
    }

    close() {
        this.stream.write('\n');
    }

    private doesCounterFitTotal() {
        return this.haveCorrectTotal && this.counter <= this.total;
    }

    private generateLeft() {
        let countStr;
        if (this.doesCounterFitTotal()) {
            const percent = Math.round(Math.min(this.counter, this.total) * 100 / this.total);
            countStr = percent == -1 ? '' : `${String(percent).padStart(3, ' ')}% `;
        } else {
            countStr = `${this.counter}${this.unit}`;
        }

        const descStr = this.desc ? `${this.desc}: ` : '';
        return ` ${descStr}${countStr}`;
    }

    private generateRight() {
        const res: string[] = [''];
        if (this.doesCounterFitTotal()) {
            const countStr = String(this.counter).padStart(this.totalDigits, ' ');
            res.push(`${countStr}/${this.total}`);
        }

        if (this.timeSpent) {
            const timePerIt = this.timeSpent / this.counter;
            const timePerItStr = (timePerIt / 1000).toFixed(3);

            const timeSpentStr = formatTimeDelta(this.timeSpent, true);
            let elapsedTime = '';
            if (this.doesCounterFitTotal()) {
                const elapsedItems = Math.max(0, this.total - this.counter);
                elapsedTime = '<' + formatTimeDelta(timePerIt * elapsedItems, true);
            }

            res.push(`[${timeSpentStr}${elapsedTime}, ${timePerItStr}s/${this.unit}]`);
        }

        if (res.length > 1) {
            res.push('');
        }

        return res.join(' ');
    }

    private generateProgressBar(reduceBy: number): string {
        if (!this.doesCounterFitTotal()) {
            return '';
        }

        const columns = this.getColumns() - reduceBy - 2;
        if (columns < 4) {
            return '';
        }

        const cnt = Math.trunc(columns * Math.min(this.counter, this.total) / this.total);
        return `|${this.progressSymbol.repeat(cnt)}${' '.repeat(columns - cnt)}|`;
    }

    private getColumns(): number {
        if (this.forceTerminal) {
            return defaultTerminalColumns;
        }
        if (this.streamIsTerminal) {
            return process.stdout.columns;
        }
        return defaultTerminalColumns;
    }
}

export class Tqdm<T extends TqdmInput> implements Iterator<TqdmItem<T>, unknown>, Iterable<TqdmItem<T>> {
    private readonly iterator: TqdmInnerIterator<T>;
    private readonly progress: TqdmProgress;

    constructor(private readonly _input: T, options: TqdmOptions = {}) {
        if (typeof this._input == 'number') {
            const x = new Array(this._input).fill(null);
            this.iterator = x[Symbol.iterator]();
        } else if (isIterable(this._input)) {
            this.iterator = this._input[Symbol.iterator]() as TqdmInnerIterator<T>;
        } else if (isIterator(this._input)) {
            this.iterator = this._input as TqdmInnerIterator<T>;
        } else {
            throw new Error('Unknown TQDM input type');
        }

        if (options.total === undefined || options.total < 0) {
            if (hasLength(this._input)) {
                options.total = this._input.length;
            } else if (typeof this._input == 'number') {
                options.total = this._input;
            }
        }
        this.progress = new TqdmProgress(options);
        this.progress.render();
    }

    [Symbol.iterator](): Tqdm<T> {
        return this;
    }

    next(): TqdmIteratorResult<T> {
        const res = this.iterator.next();
        if (res.done) {
            this.progress.close();
        } else {
            this.progress.update();
        }
        return res;
    }
}

export function tqdm<T extends TqdmInput>(input: T, opts: TqdmOptions = {}): Tqdm<T> {
    return new Tqdm(input, opts);
}
