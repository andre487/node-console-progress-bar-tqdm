export type TqdmInput = Iterable<unknown> | Iterator<unknown, unknown, unknown> | number;
export type TqdmItem<T> = T extends Iterable<infer Item> ?
        Item :
        T extends Iterator<infer Item> ?
                Item :
                null;

export type TqdmInnerIterator<T> = Iterator<TqdmItem<T>, unknown, unknown>;
export type TqdmIteratorResult<T> = IteratorResult<TqdmItem<T>, unknown>;

export interface TqdmOptions {
    desc?: string; // A prefix for the progress bar
    total?: number; // The number of expected iterations
}
