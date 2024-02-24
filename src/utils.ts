import {EOL} from 'node:os';
import tty from 'node:tty';
import {RawUnitType, UnitTableType} from './base-types';

interface LengthHolder<T = unknown> {
    length: T;
}

interface FdHolder<T = unknown> {
    fd: T;
}

const defaultTerminalColumns = 80;

const pluralKeys: Readonly<Intl.LDMLPluralRule[]> = ['zero', 'one', 'two', 'few', 'many', 'other'];
export const pluralService = new Intl.PluralRules('en-US');

const _hasOwnProperty = Object.prototype.hasOwnProperty;

export function hasOwnProperty(obj: object, key: string): boolean {
    return _hasOwnProperty.call(obj, key);
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

export function hasFd(x: unknown): x is FdHolder<number> {
    if (!isObject(x)) {
        return false;
    }
    return typeof (x as FdHolder).fd == 'number';
}

export function formatTimeDelta(time: number, showFractions = false): string {
    const dt = new Date(time).toISOString();
    const matches = /(\d+)-(\d+)-(\d+)T(\d+):(\d+):(\d+).(\d+)Z/.exec(dt);
    if (!matches) {
        return '';
    }

    let res = '';
    const [
        ,
        years1970Str,
        monthsStr,
        daysStr,
        hoursStr,
        minutesStr,
        secondsStr,
        fracStr,
    ] = matches;

    const years = parseInt(years1970Str) - 1970;
    if (years) {
        const name = pluralService.select(years) == 'one' ? 'year' : 'years';
        res += `${years} ${name}, `;
    }

    const months = parseInt(monthsStr) - 1;
    if (months) {
        const name = pluralService.select(months) == 'one' ? 'month' : 'months';
        res += `${months} ${name}, `;
    }

    const days = parseInt(daysStr) - 1;
    if (days) {
        const name = pluralService.select(days) == 'one' ? 'day' : 'days';
        res += `${days} ${name}, `;
    }

    const hours = parseInt(hoursStr);
    if (hours) {
        res += `${hoursStr}:`;
    }

    res += `${minutesStr}:${secondsStr}`;
    if (showFractions) {
        res += `.${fracStr}`;
    }

    return res;
}

export function handleUnit(unit: RawUnitType): UnitTableType {
    const res = {} as UnitTableType;
    if (typeof unit == 'string') {
        for (const unitKey of pluralKeys) {
            res[unitKey] = unit;
        }
    } else if (Array.isArray(unit)) {
        res['one'] = unit[0];
        for (const unitKey of pluralKeys) {
            if (!hasOwnProperty(res, unitKey)) {
                res[unitKey] = unit[1];
            }
        }
    } else if (isObject(unit)) {
        Object.assign(res, unit);
        const defaultVal = res['many'] ?? res['few'] ?? res['one'] ?? res['other'] ?? 'it';
        for (const unitKey of pluralKeys) {
            if (!hasOwnProperty(res, unitKey)) {
                res[unitKey] = defaultVal;
            }
        }
    }
    return res;
}

export function scaleUnit(x: number): string {
    const sign = Math.sign(x);
    const val = Math.abs(x);

    if (val < 1000) {
        return x.toString();
    }

    const digits = Math.trunc(Math.log10(val)) + 1;
    if (digits >= 3 && digits <= 6) {
        const res = sign * Math.round(val * 100 / 1e3) / 100;
        return `${res.toFixed(2)}k`;
    }

    if (digits > 6 && digits <= 9) {
        const res = sign * Math.round(val * 100 / 1e6) / 100;
        return `${res.toFixed(2)}M`;
    }

    if (digits > 9 && digits <= 12) {
        const res = sign * Math.round(val * 100 / 1e9) / 100;
        return `${res.toFixed(2)}G`;
    }

    const res = sign * Math.round(val * 100 / 1e12) / 100;
    return `${res.toFixed(2)}T`;
}

export class TqdmWriteStream {
    readonly resetLine: () => void;

    constructor(
        private readonly stream: NodeJS.WritableStream | tty.WriteStream,
        forceTerminal = false,
    ) {
        this.resetLine = this.generalResetLine;

        if (stream instanceof tty.WriteStream && hasFd(stream) && tty.isatty(stream.fd)) {
            this.resetLine = this.ttyResetLine;
            process.once('SIGWINCH', this.onTerminalResize);
        } else if (forceTerminal) {
            this.resetLine = this.forceTerminalResetLine;
        }
    }

    get columns(): number {
        const stream = this.getStreamAsTty();
        if (stream) {
            return stream.columns;
        }
        return defaultTerminalColumns;
    }

    write(chunk: string) {
        this.stream.write(chunk);
    }

    finalize() {
        process.off('SIGWINCH', this.onTerminalResize);
        this.stream.write(EOL);
    }

    clearScreen() {
        const stream = this.getStreamAsTty();
        if (stream) {
            stream.write(EOL);
            stream.write('\x1B[2J');
            stream.cursorTo(0, 0);
        }
    }

    private onTerminalResize = () => {
        this.clearScreen();
        process.once('SIGWINCH', this.onTerminalResize);
    };

    private getStreamAsTty() {
        if (this.stream instanceof tty.WriteStream) {
            return this.stream;
        }
        return null;
    }

    private ttyResetLine = () => {
        const stream = this.getStreamAsTty();
        if (stream) {
            stream.clearLine(0);
            stream.cursorTo(0);
        } else {
            this.forceTerminalResetLine();
        }
    };

    private forceTerminalResetLine = () => {
        // ANSI/VT100 codes: https://bash-hackers.gabe565.com/scripting/terminalcodes/
        // \x1b – ESC, ^[: Start an escape sequence.
        // \x1b[ – ESC + [.
        // 0G – Move cursor to the 0th column of the current row.
        // K – Clear string from the cursor position to the end of line.
        this.stream.write('\x1b[0G\x1b[K');
    };

    private generalResetLine = () => {
        this.stream.write(EOL);
    };
}
