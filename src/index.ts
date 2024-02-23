export type TqdmInput<T> = Iterable<T> | Iterator<T, unknown, unknown> | number;

export class Tqdm<T> implements Iterator<T, undefined>, Iterable<T> {
    private readonly _iterator: Iterator<T, unknown, unknown>;

    constructor(private readonly _input: TqdmInput<T>) {
        if (typeof this._input == 'number') {
            const x = new Array(this._input).fill(null);
            this._iterator = x[Symbol.iterator]();
        } else if (isIterable(this._input)) {
            this._iterator = this._input[Symbol.iterator]();
        } else if (isIterator(this._input)) {
            this._iterator = this._input;
        } else {
            throw new Error('Unknown TQDM input type');
        }
    }

    [Symbol.iterator](): Iterator<T, undefined> {
        return this;
    }

    next(): IteratorResult<T, undefined> {
        const res = this._iterator.next();
        if (res.done) {
            return {value: undefined, done: true};
        }
        return res;
    }
}

export function tqdm<T>(input: TqdmInput<T>): Tqdm<T> {
    return new Tqdm(input);
}

function isObject(x: unknown): x is object {
    return x !== null && typeof x == 'object';
}

function isIterable<T>(x: unknown): x is Iterable<T> {
    if (!isObject(x)) {
        return false;
    }
    return typeof (x as Iterable<unknown>)[Symbol.iterator] == 'function';
}


function isIterator<T>(x: unknown): x is Iterator<T> {
    if (!isObject(x)) {
        return false;
    }
    return typeof (x as Iterator<unknown>).next == 'function';
}
