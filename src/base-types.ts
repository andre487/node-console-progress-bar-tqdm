export type TqdmInput = Iterable<unknown> |
    Iterator<unknown> |
    AsyncIterable<unknown> |
    AsyncIterator<unknown> |
    number;

export type TqdmItem<TInput> = TInput extends Iterable<infer Item> ?
    Item :
    TInput extends Iterator<infer Item> ?
        Item :
        TInput extends AsyncIterable<infer Item> ?
            Item :
            TInput extends AsyncIterator<infer Item> ?
                Item :
                TInput extends number ?
                    number :
                    never;

export type TqdmUnitTableType = Record<Intl.LDMLPluralRule, string>;
export type TqdmRawUnitType = string | [string, string] | TqdmUnitTableType;

export type TqdmOptions = {
    // Description, the prefix for the progress bar.
    description?: string;

    // The width of the entire output message.
    // By default, the output fills whole the line.
    maxColWidth?: number;

    // "Braces" around the progress bar.
    // Default: ["|", "|"].
    progressBraces?: [string, string];

    // Symbol for building the progress bar.
    // Default: "█".
    progressSymbol?: string;

    // Color of the progress bar in terminal format.
    // If it's not set will be color by default.
    // This value is corresponding to ANSI format: https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
    // Examples:
    //   1. 4-bit (8) colors: "black", "red", …, "white".
    //   2. 8-bit (256) colors, prefix "$": "$16", "$17", …, "$255".
    //   3. 24-bit colors: "#ccc", "#00ff12" – CSS-like color literal.
    progressColor?: string;

    // Counter initial value.
    // Default: 0.
    initial?: number;

    // The number of expected iterations.
    // If not specified and `input` has `length`, `input.length` will be used.
    // If `input` is number, this number will be used.
    total?: number;

    // Value that will be used to define the unit of each iteration.
    // It can be a string: "thing", a tuple: ["one thing", "many things"]
    // or a table:
    // {
    //   "zero":  "0 things",
    //   "one":   "1 thing",
    //   "two":   "2 things",
    //   "few":   "few things",
    //   "many":  "many things",
    //   "other": "some things"
    // }
    // Default: "it".
    unit?: TqdmRawUnitType;

    // If true, the number of iterations will be reduced/scaled
    // automatically and a metric prefix following the
    // International System of Units standard will be added
    // (kilo, mega, etc.).
    // Default: false.
    unitScale?: boolean;

    // Stream to write the progress bar.
    // Default: `process.stderr`.
    stream?: NodeJS.WritableStream,

    // Minimum progress display update interval in milliseconds.
    // Default: 50ms.
    minInterval?: number;

    // Force output like the stream is a terminal.
    // Try to emulate the terminal behavior.
    forceTerminal?: boolean;
};

export interface ITqdmProgress {
    update(by?: number): void;

    render(force?: boolean): void;

    close(): void;
}

export interface ITqdmSyncIteratorContainer<TItem> {
    nextSync(): IteratorResult<TItem>;
}

export interface ITqdmAsyncIteratorContainer<TItem> {
    nextAsync(): Promise<IteratorResult<TItem>>;
}
