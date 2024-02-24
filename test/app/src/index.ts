import {tqdm} from '../../../src';

const data = new Array(100).fill(0).map((_, idx) => idx);

function* gen() {
    for (const item of data) {
        yield item;
    }
}

function someWork() {
    for (let i = 0; i < 100000; ++i) {
        process.stderr.write('');
    }
}

for (const _ of tqdm(100, {desc: 'NUM'})) {
    someWork();
}

for (const _ of tqdm(data, {desc: 'ARR', progressSymbol: '='})) {
    someWork();
}

for (const _ of tqdm(gen(), {desc: 'GEN', unit: 'thing'})) {
    someWork();
}
