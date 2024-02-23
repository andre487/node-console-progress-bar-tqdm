import {tqdm} from '../../../src';

const data = new Array(100).fill(0).map((_, idx) => idx);

for (const item of tqdm(data)) {
    console.log(item);
}
