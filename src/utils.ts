import {RawUnitType, UnitTableType} from './base-types';

interface LengthHolder<T = unknown> {
    length: T;
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
