const {tqdm} = require('../../dist/index');

for (const item of tqdm([1, 2, 3, 4])) {
    console.log(item);
}
