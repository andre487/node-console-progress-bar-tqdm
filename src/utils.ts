interface LengthHolder<T = unknown> {
    length: T;
}

const pluralRules = new Intl.PluralRules('en-US');

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
        const name = pluralRules.select(years) == 'one' ? 'year' : 'years';
        res += `${years} ${name}, `;
    }

    const months = parseInt(monthsStr) - 1;
    if (months) {
        const name = pluralRules.select(months) == 'one' ? 'month' : 'months';
        res += `${months} ${name}, `;
    }

    const days = parseInt(daysStr) - 1;
    if (days) {
        const name = pluralRules.select(days) == 'one' ? 'day' : 'days';
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
