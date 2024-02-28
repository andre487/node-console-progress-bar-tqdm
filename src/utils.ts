import {TqdmUnitOption, TqdmUnitTable} from './base-types';

interface LengthHolder<T = unknown> {
    length: T;
}

interface FdHolder<T = unknown> {
    fd: T;
}

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

export function isAsyncIterable<T>(x: unknown): x is AsyncIterable<T> {
    if (!isObject(x)) {
        return false;
    }
    return typeof (x as AsyncIterable<unknown>)[Symbol.asyncIterator] == 'function';
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

export function handleUnit(unit: TqdmUnitOption): TqdmUnitTable {
    const res = {} as TqdmUnitTable;
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
