interface LengthHolder<T = unknown> {
    length: T;
}

export function isObject(x: unknown): x is object {
    return x !== null && typeof x == 'object';
}

export function isIterable<T>(x: unknown): x is Iterable<T> {
    if (!isObject(x)) {
        return false;
    }
    return typeof (x as Iterable<unknown>)[Symbol.iterator] == 'function';
}


export function isIterator<T>(x: unknown): x is Iterator<T> {
    if (!isObject(x)) {
        return false;
    }
    return typeof (x as Iterator<unknown>).next == 'function';
}

export function hasLength(x: unknown): x is LengthHolder<number> {
    if (!isObject(x)) {
        return false;
    }
    return typeof (x as LengthHolder).length == 'number';
}
