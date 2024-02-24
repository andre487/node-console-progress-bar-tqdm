import {describe, expect, test} from '@jest/globals';
import * as utils from '../../src/utils';

describe('#formatTimeDelta()', () => {
    test('Zero time', () => {
        const res = utils.formatTimeDelta(0);
        expect(res).toBe('00:00');
    });

    test('Zero time with fractions', () => {
        const res = utils.formatTimeDelta(0, true);
        expect(res).toBe('00:00.000');
    });

    test('Several hours with fractions', () => {
        const res = utils.formatTimeDelta(9200020, true);
        expect(res).toBe('02:33:20.020');
    });

    test('One day with fractions', () => {
        const res = utils.formatTimeDelta(99200000, true);
        expect(res).toBe('1 day, 03:33:20.000');
    });

    test('Several days day with fractions', () => {
        const res = utils.formatTimeDelta(1109200110, true);
        expect(res).toBe('12 days, 20:06:40.110');
    });

    test('One month, 0 days with fractions', () => {
        const res = utils.formatTimeDelta(2700000891, true);
        expect(res).toBe('1 month, 06:00:00.891');
    });

    test('One month, several days with fractions', () => {
        const res = utils.formatTimeDelta(2900000800, true);
        expect(res).toBe('1 month, 2 days, 13:33:20.800');
    });

    test('Several month, several days with fractions', () => {
        const res = utils.formatTimeDelta(8900000801, true);
        expect(res).toBe('3 months, 13 days, 13:20.801');
    });

    test('One year, 0 days with fractions', () => {
        const res = utils.formatTimeDelta(31536111000, true);
        expect(res).toBe('1 year, 01:51.000');
    });

    test('One year, several days with fractions', () => {
        const res = utils.formatTimeDelta(36730800000, true);
        expect(res).toBe('1 year, 2 months, 1 day, 03:00:00.000');
    });

    test('Several years, several days with fractions', () => {
        const res = utils.formatTimeDelta(99802800000, true);
        expect(res).toBe('3 years, 2 months, 03:00:00.000');
    });

    test('Very many years, several days with fractions', () => {
        const res = utils.formatTimeDelta(94613194800000, true);
        expect(res).toBe('2998 years, 2 months, 3 days, 03:00:00.000');
    });
});
