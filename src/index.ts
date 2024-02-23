export type TqdmIterable<T> = T[] | Generator<T>;

export function* tqdm<T>(iterable: TqdmIterable<T>): Generator<T> {
    for (const item of iterable) {
        yield item;
    }
}
