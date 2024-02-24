export type TqdmInput = Iterable<unknown> | Iterator<unknown, unknown, unknown> | number;
export type TqdmItem<T> = T extends Iterable<infer Item> ?
    Item :
    T extends Iterator<infer Item> ?
        Item :
        null;

export type TqdmInnerIterator<T> = Iterator<TqdmItem<T>, unknown, unknown>;
export type TqdmIteratorResult<T> = IteratorResult<TqdmItem<T>, unknown>;

export type UnitTableType = Record<Intl.LDMLPluralRule, string>;
export type RawUnitType = string | [string, string] | UnitTableType;

export interface TqdmOptions {
    // The prefix for the progress bar.
    desc?: string;

    // The width of the entire output message.
    // By default, the output fills whole the line.
    nCols?: number;

    // "Braces" around the progress bar.
    // Default: ["|", "|"].
    progressBraces?: [string, string];

    // Symbol for building the progress bar.
    // Default: "█".
    progressSymbol?: string;

    // Color of the progress bar in terminal format.
    // If it's not set will be color by default.
    // This value should be in ANSI format: https://en.wikipedia.org/wiki/ANSI_escape_code#Colors
    // Examples of foreground colors: "\x1B[31m", "\x1B[38;5;118m".
    // Examples with a background: "\x1B[37m\x1B[41m", "\x1B[38;5;231m\x1B[48;5;18m".
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
    unit?: RawUnitType;

    // If true, the number of iterations will be reduced/scaled
    // automatically and a metric prefix following the
    // International System of Units standard will be added
    // (kilo, mega, etc.).
    // Default: false.
    unitScale?: boolean;

    // Stream to write the progress bar.
    // Default: `process.stderr`.
    stream?: NodeJS.WritableStream;

    // Minimum progress display update interval in milliseconds.
    // Default: 50ms.
    minInterval?: number;

    // Force output like the stream is a terminal.
    // Try to emulate the terminal behavior.
    forceTerminal?: boolean;
}
