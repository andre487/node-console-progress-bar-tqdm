import {hasOwnProperty} from './utils';

export const enum ColorType {
    Fg = 'fg',
    Bg = 'bg',
}

const basicAnsiColorsTable = {
    'black': '0',
    'red': '1',
    'green': '2',
    'yellow': '3',
    'blue': '4',
    'magenta': '5',
    'cyan': '6',
    'white': '7',
};

export type BasicAnsiColorName = keyof typeof basicAnsiColorsTable;

export function getTermColor(name: string, colorType: ColorType = ColorType.Fg): string {
    let color = '\x1B[';
    if (isBasicAnsiColor(name)) {
        color += (colorType == ColorType.Fg ? '3' : '4') + basicAnsiColorsTable[name];
    } else if (is8BitAnsiColor(name)) {
        color += (colorType == ColorType.Fg ? '38' : '48') + `;5;${name.slice(1)}`;
    } else if (is24BitAnsiColor(name)) {
        const clr = parse24BitColor(name);
        color += (colorType == ColorType.Fg ? '38' : '48') + `;2;${clr.r};${clr.g};${clr.b}`;
    } else {
        if (colorType == ColorType.Fg) {
            color += '39';
        } else {
            color += '49';
        }
    }
    color += 'm';
    return color;
}

export function getTermColorReset(): string {
    return '\x1B[0m';
}

export function isBasicAnsiColor(x: unknown): x is BasicAnsiColorName {
    return hasOwnProperty(basicAnsiColorsTable, x as string);
}

export function is8BitAnsiColor(x: unknown): boolean {
    if (typeof x != 'string') {
        return false;
    }

    const matches = /^\$(\d{2,3})$/.exec(x);
    if (!matches) {
        return false;
    }

    const colorId = parseInt(matches[1]);
    return colorId >= 16 && colorId <= 255;
}

export function is24BitAnsiColor(x: unknown): boolean {
    if (typeof x != 'string') {
        return false;
    }
    return /^#[\da-f]{3,6}$/i.test(x);
}

export function parse24BitColor(color: string) {
    let hexR = 'ff';
    let hexG = 'ff';
    let hexB = 'ff';
    let matches: RegExpExecArray | null;

    if ((matches = /^#([\da-f])([\da-f])([\da-f])$/i.exec(color))) {
        [, hexR, hexG, hexB] = matches;
        hexR = hexR.repeat(2);
        hexG = hexG.repeat(2);
        hexB = hexB.repeat(2);
    } else if ((matches = /^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i.exec(color))) {
        [, hexR, hexG, hexB] = matches;
    }

    return {
        r: parseInt(hexR, 16),
        g: parseInt(hexG, 16),
        b: parseInt(hexB, 16),
    };
}
