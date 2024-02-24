import {TqdmInnerIterator, TqdmInput, TqdmItem, TqdmIteratorResult, TqdmOptions, UnitTableType} from './base-types';
import {NumericIterator, TqdmWriteStream} from './supply';
import {getTermColor, getTermColorReset} from './term';
import {formatTimeDelta, handleUnit, hasLength, isIterable, isIterator, pluralService, scaleUnit} from './utils';

const defaultOptions: Required<TqdmOptions> = {
    desc: '',
    nCols: -1,
    progressBraces: ['|', '|'],
    progressSymbol: '█',
    progressColor: '',
    unit: 'it',
    unitScale: false,
    initial: 0,
    total: -1,
    stream: process.stderr,
    minInterval: 50,
    forceTerminal: false,
};

export class TqdmProgress {
    private readonly desc: string;
    private readonly unit: UnitTableType;
    private readonly nCols: number;
    private readonly progressLeftBrace: string;
    private readonly progressRightBrace: string;
    private readonly progressSymbol: string;
    private readonly progressColor: string = '';
    private readonly progressColorReset: string = '';
    private readonly stream: TqdmWriteStream;
    private readonly minInterval: number;

    private readonly total: number;
    private readonly totalDigits: number = 0;
    private readonly unitScale: boolean;
    private readonly unitDelimiter: string = '';
    private readonly totalScaled: string = '';
    private readonly haveCorrectTotal: boolean;

    private readonly startTime: number = Date.now();
    private lastRenderTime: number = 0;
    private timeSpent: number = 0;
    private counter: number;

    private readonly num: (x: number) => string;

    constructor(options: TqdmOptions) {
        const fullOptions = {
            ...defaultOptions,
            ...options,
        };
        this.desc = fullOptions.desc;
        this.unit = handleUnit(fullOptions.unit);
        this.nCols = fullOptions.nCols;

        [this.progressLeftBrace, this.progressRightBrace] = fullOptions.progressBraces;
        this.progressSymbol = fullOptions.progressSymbol;

        this.stream = new TqdmWriteStream(fullOptions.stream, fullOptions.forceTerminal);
        this.minInterval = fullOptions.minInterval;

        if (this.stream.isTty) {
            this.progressColor = getTermColor(fullOptions.progressColor);
            if (this.progressColor) {
                this.progressColorReset = getTermColorReset();
            }
        }

        this.counter = fullOptions.initial;
        this.total = fullOptions.total;
        this.haveCorrectTotal = isFinite(this.total) && !isNaN(this.total) && this.total > 0;
        if (this.haveCorrectTotal) {
            this.totalDigits = Math.trunc(Math.log10(this.total)) + 1;
        }

        this.unitScale = fullOptions.unitScale;
        if (fullOptions.unitScale) {
            this.num = this.numScale;
            this.unitDelimiter = ' ';
            if (this.haveCorrectTotal) {
                this.totalScaled = scaleUnit(this.total);
            }
        } else {
            this.num = this.numNoScale;
        }
    }

    update(by: number = 1) {
        this.counter += by;
        this.timeSpent = Date.now() - this.startTime;
        this.render();
    }

    render(force = false) {
        const now = Date.now();
        if (!force && now - this.lastRenderTime < this.minInterval) {
            return;
        }
        this.lastRenderTime = now;

        const left = this.generateLeft();
        const right = this.generateRight();
        const progressBar = this.generateProgressBar(left.length + right.length);
        this.stream.resetLine();
        this.stream.write(`${left}${progressBar}${right}`);
    }

    close() {
        this.stream.finalize();
    }

    private numScale(x: number) {
        return scaleUnit(x);
    }

    private numNoScale(x: number) {
        return x.toString();
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
            const unitKey = pluralService.select(this.counter);
            countStr = `${this.num(this.counter)}${this.unitDelimiter}${this.unit[unitKey]}`;
        }

        const descStr = this.desc ? `${this.desc}: ` : '';
        return ` ${descStr}${countStr}`;
    }

    private generateRight() {
        const res: string[] = [''];
        if (this.doesCounterFitTotal()) {
            if (this.unitScale) {
                res.push(`${this.num(this.counter)}/${this.totalScaled}`);
            } else {
                const countStr = String(this.counter).padStart(this.totalDigits, ' ');
                res.push(`${countStr}/${this.total}`);
            }
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

            res.push(`[${timeSpentStr}${elapsedTime}, ${timePerItStr}s/${this.unit['one']}]`);
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

        const ttyColumns = this.stream.columns;
        const baseColumns = this.nCols > 0 ? Math.min(this.nCols, ttyColumns) : ttyColumns;
        const columns = baseColumns - reduceBy - 2;

        if (columns < 4) {
            return '';
        }

        const cnt = Math.trunc(columns * Math.min(this.counter, this.total) / this.total);
        return [
            this.progressLeftBrace,
            this.progressColor,
            this.progressSymbol.repeat(cnt),
            ' '.repeat(columns - cnt),
            this.progressColorReset,
            this.progressRightBrace,
        ].join('');
    }
}

export class Tqdm<T extends TqdmInput> implements Iterator<TqdmItem<T>, unknown>, Iterable<TqdmItem<T>> {
    private readonly iterator: TqdmInnerIterator<T>;
    private readonly progress: TqdmProgress;

    constructor(private readonly _input: T, options: TqdmOptions = {}) {
        if (typeof this._input == 'number') {
            this.iterator = new NumericIterator(this._input) as TqdmInnerIterator<T>;
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
            // TODO: fix last render
            // this.progress.render(true);
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
