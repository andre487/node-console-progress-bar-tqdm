export type TqdmInput = Iterable<unknown> | Iterator<unknown, unknown, unknown> | number;
export type TqdmItem<T> = T extends Iterable<infer Item> ?
    Item :
    T extends Iterator<infer Item> ?
        Item :
        null;

export type TqdmInnerIterator<T> = Iterator<TqdmItem<T>, unknown, unknown>;
export type TqdmIteratorResult<T> = IteratorResult<TqdmItem<T>, unknown>;

export interface TqdmOptions {
    // A prefix for the progress bar.
    desc?: string;

    // Symbol for building the progress bar.
    // Default: "█".
    progressSymbol?: string;

    // Counter initial value.
    // Default: 0.
    initial?: number;

    // The number of expected iterations.
    // If not specified and `input` has `length`, `input.length` will be used.
    // If `input` is number, this number will be used.
    total?: number;

    // String that will be used to define the unit of each iteration.
    // Default: "it".
    // TODO: Make plural
    unit?: string;

    // Stream to write the progress bar.
    // Default: `process.stderr`.
    stream?: NodeJS.WritableStream;

    // Force output like the stream is a terminal.
    forceTerminal?: boolean;
}
