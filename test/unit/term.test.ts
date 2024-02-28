import {describe, expect, test} from '@jest/globals';
import {getTermColor, getTermColorReset} from '../../src/term';

describe('#getTermColor()', () => {
    test('Basic colors', () => {
        expect(getTermColor('black')).toBe('\x1B[30m');
        expect(getTermColor('red')).toBe('\x1B[31m');
        expect(getTermColor('green')).toBe('\x1B[32m');
        expect(getTermColor('yellow')).toBe('\x1B[33m');
        expect(getTermColor('blue')).toBe('\x1B[34m');
        expect(getTermColor('magenta')).toBe('\x1B[35m');
        expect(getTermColor('cyan')).toBe('\x1B[36m');
        expect(getTermColor('white')).toBe('\x1B[37m');
    });

    test('8-bit colors', () => {
        expect(getTermColor('$16')).toBe('\x1B[38;5;16m');
        expect(getTermColor('$160')).toBe('\x1B[38;5;160m');
        expect(getTermColor('$255')).toBe('\x1B[38;5;255m');
    });

    test('24-bit colors', () => {
        expect(getTermColor('#000')).toBe('\x1B[38;2;0;0;0m');
        expect(getTermColor('#ccc')).toBe('\x1B[38;2;204;204;204m');
        expect(getTermColor('#fcd3c2')).toBe('\x1B[38;2;252;211;194m');
    });

    test('Reset', () => {
        expect(getTermColorReset()).toBe('\x1B[0m');
    });
});
