import {
    ITqdmAsyncIteratorContainer,
    ITqdmSyncIteratorContainer,
    ITqdmProgress,
    TqdmInput,
    TqdmItem,
    TqdmOptions,
    TqdmUnitTable,
} from './base-types';
import {
    TqdmAsyncResultIteratorReturn,
    TqdmSyncResultIterator,
    TqdmSyncResultIteratorReturn,
    TqdmInnerIterator,
    TqdmIteratorResultSync,
    TqdmAsyncResultIterator,
    TqdmNumericIterator,
    TqdmIteratorResultAsync,
    TqdmWriteStream,
} from './supply';
import {getTermColor, getTermColorReset} from './term';
import {
    formatTimeDelta,
    handleUnit,
    hasLength,
    isAsyncIterable,
    isIterable,
    isIterator,
    pluralService,
    scaleUnit,
} from './utils';

export {
    ITqdmAsyncIteratorContainer,
    ITqdmSyncIteratorContainer,
    ITqdmProgress,
    TqdmInput,
    TqdmOptions,
    TqdmUnitTable,
    TqdmUnitOption,
} from './base-types';
export {
    TqdmAsyncResultIterator,
    TqdmSyncResultIterator,
} from './supply';

const defaultOptions: Required<TqdmOptions> = {
    description: '',
    maxColWidth: -1,
    progressBraces: ['|', '|'],
    progressSymbol: '█',
    progressColor: '',
    unit: 'it',
    unitScale: false,
    initial: 0,
    total: -1,
    step: 1,
    stream: process.stderr,
    minInterval: 50,
    forceTerminal: false,
};

export function tqdm<T extends TqdmInput>(input: T, opts: TqdmOptions = {}): Tqdm<T> {
    return new Tqdm(input, opts);
}

export class Tqdm<TInput extends TqdmInput> implements Iterable<TqdmItem<TInput>>,
    AsyncIterable<TqdmItem<TInput>>,
    ITqdmSyncIteratorContainer<TqdmItem<TInput>>,
    ITqdmAsyncIteratorContainer<TqdmItem<TInput>> {
    private readonly iterator: TqdmInnerIterator<TqdmItem<TInput>>;
    private readonly progress: ITqdmProgress;

    constructor(private readonly _input: TInput, options: TqdmOptions = {}) {
        if (typeof this._input == 'number') {
            this.iterator = new TqdmNumericIterator(this._input) as TqdmInnerIterator<TqdmItem<TInput>>;
        } else if (isIterable(this._input)) {
            this.iterator = this._input[Symbol.iterator]() as TqdmInnerIterator<TqdmItem<TInput>>;
        } else if (isAsyncIterable(this._input)) {
            this.iterator = this._input[Symbol.asyncIterator]() as TqdmInnerIterator<TqdmItem<TInput>>;
        } else if (isIterator(this._input)) {
            this.iterator = this._input as TqdmInnerIterator<TqdmItem<TInput>>;
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

    [Symbol.iterator](): TqdmSyncResultIteratorReturn<TInput> {
        return new TqdmSyncResultIterator(this) as TqdmSyncResultIteratorReturn<TInput>;
    }

    [Symbol.asyncIterator](): TqdmAsyncResultIteratorReturn<TInput> {
        return new TqdmAsyncResultIterator(this) as TqdmAsyncResultIteratorReturn<TInput>;
    }

    nextSync(): TqdmIteratorResultSync<TInput> {
        const res = this.iterator.next();
        if (res instanceof Promise) {
            throw new Error('Async value in sync iterator');
        }

        if (res.done) {
            this.progress.render(true);
            this.progress.close();
        } else {
            this.progress.update();
        }

        return res as TqdmIteratorResultSync<TInput>;
    }

    nextAsync(): TqdmIteratorResultAsync<TInput> {
        const pRes = this.iterator.next();
        if (!(pRes instanceof Promise)) {
            throw new Error('Sync value in async iterator');
        }

        return new Promise((resolve, reject) => {
            pRes.then((res) => {
                if (res.done) {
                    this.progress.render(true);
                    this.progress.close();
                } else {
                    this.progress.update();
                }
                resolve(res);
            }).catch(reject);
        }) as TqdmIteratorResultAsync<TInput>;
    }
}

export class TqdmProgress implements ITqdmProgress {
    private readonly description: string;
    private readonly unit: TqdmUnitTable;
    private readonly maxColWidth: number;
    private readonly progressLeftBrace: string;
    private readonly progressRightBrace: string;
    private readonly progressSymbol: string;
    private readonly progressColor: string = '';
    private readonly progressColorReset: string = '';
    private readonly stream: TqdmWriteStream;
    private readonly minInterval: number;

    private readonly total: number;
    private readonly totalDigits: number = 0;
    private readonly initial: number;
    private readonly step: number;
    private readonly unitScale: boolean;
    private readonly unitDelimiter: string = '';
    private readonly totalScaled: string = '';
    private readonly haveCorrectTotal: boolean;

    private readonly startTime: number = Date.now();
    private lastRenderTime: number = 0;
    private timeSpent: number = 0;
    private position: number;
    private itCounter: number = 0;

    private readonly num: (x: number) => string;

    constructor(options: TqdmOptions) {
        const fullOptions = {
            ...defaultOptions,
            ...options,
        };
        this.description = fullOptions.description;
        this.unit = handleUnit(fullOptions.unit);
        this.maxColWidth = fullOptions.maxColWidth;

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

        this.initial = this.position = fullOptions.initial;
        this.total = fullOptions.total;
        this.haveCorrectTotal = isFinite(this.total) && !isNaN(this.total) && this.total > 0;
        if (this.haveCorrectTotal) {
            this.totalDigits = Math.trunc(Math.log10(this.total)) + 1;
        }
        this.step = fullOptions.step;

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

    update(by: number = this.step) {
        this.position += by;
        ++this.itCounter;
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

    private doesPositionFitTotal() {
        return this.haveCorrectTotal && this.position <= this.total;
    }

    private generateLeft() {
        let countStr;
        if (this.doesPositionFitTotal()) {
            const percent = Math.round(Math.min(this.position, this.total) * 100 / this.total);
            countStr = percent == -1 ? '' : `${String(percent).padStart(3, ' ')}% `;
        } else {
            const unitKey = pluralService.select(this.position);
            countStr = `${this.num(this.position)}${this.unitDelimiter}${this.unit[unitKey]}`;
        }

        const descStr = this.description ? `${this.description}: ` : '';
        return ` ${descStr}${countStr}`;
    }

    private generateRight() {
        const res: string[] = [''];
        if (this.doesPositionFitTotal()) {
            if (this.unitScale) {
                res.push(`${this.num(this.position)}/${this.totalScaled}`);
            } else {
                const countStr = String(this.position).padStart(this.totalDigits, ' ');
                res.push(`${countStr}/${this.total}`);
            }
        }

        if (this.timeSpent) {
            const timePerIt = this.timeSpent / this.itCounter;
            const timePerItStr = (timePerIt / 1000).toFixed(3);

            const timeSpentStr = formatTimeDelta(this.timeSpent, true);
            let elapsedTime = '';
            if (this.doesPositionFitTotal()) {
                const elapsedItems = this.step > 0 ?
                    Math.max(0, this.total - this.position) :
                    Math.max(0, this.total - (this.initial - this.position));
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
        if (!this.doesPositionFitTotal()) {
            return '';
        }

        const ttyColumns = this.stream.columns;
        const baseColumns = this.maxColWidth > 0 ? Math.min(this.maxColWidth, ttyColumns) : ttyColumns;
        const columns = baseColumns - reduceBy - 2;

        if (columns < 4) {
            return '';
        }

        const cnt = Math.trunc(columns * Math.min(this.position, this.total) / this.total);
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
