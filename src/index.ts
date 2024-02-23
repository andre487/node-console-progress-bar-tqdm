import {TqdmInnerIterator, TqdmInput, TqdmItem, TqdmIteratorResult, TqdmOptions} from './base-types';
import {hasLength, isIterable, isIterator} from './utils';

const defaultOptions: TqdmOptions = {
    desc: '',
};

export class Tqdm<T extends TqdmInput> implements Iterator<TqdmItem<T>, unknown>, Iterable<TqdmItem<T>> {
    private readonly _iterator: TqdmInnerIterator<T>;
    private readonly _options: TqdmOptions;

    constructor(private readonly _input: T, opts: TqdmOptions = {}) {
        if (typeof this._input == 'number') {
            const x = new Array(this._input).fill(null);
            this._iterator = x[Symbol.iterator]();
        } else if (isIterable(this._input)) {
            this._iterator = this._input[Symbol.iterator]() as TqdmInnerIterator<T>;
        } else if (isIterator(this._input)) {
            this._iterator = this._input as TqdmInnerIterator<T>;
        } else {
            throw new Error('Unknown TQDM input type');
        }

        if (opts.total === undefined && hasLength(this._input)) {
            opts.total = this._input.length;
        }

        this._options = {
            ...defaultOptions,
            ...opts,
        };
    }

    [Symbol.iterator](): Iterator<TqdmItem<T>> {
        return this;
    }

    next(): TqdmIteratorResult<T> {
        return this._iterator.next();
    }
}

export function tqdm<T extends TqdmInput>(input: T, opts: TqdmOptions = {}): Tqdm<T> {
    return new Tqdm(input, opts);
}
