export class NumericIterator implements Iterator<number, undefined> {
    private cnt = 0;

    constructor(private readonly num: number) {}

    next(): IteratorResult<number, undefined> {
        const val = this.cnt++;
        if (val >= this.num) {
            return {value: undefined, done: true};
        }
        return {value: val, done: false};
    }
}
