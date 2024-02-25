# TQDM-like progress bar for Node.js console applications

```
node-console-progress-bar-tqdm
```

This is a library that implements progress bar in console for Node.js in the style of
[tqdm](https://tqdm.github.io/) Python library.

This library implements very similar interface and options set.

Language support: TypeScript and JavaScript with CommonJS and EcmaScript modules.

Input data support: `Array`, `Number`, `Generator`, `AsyncGenerator`, `Iterable`, `Iterator`, `AsyncIterable`, `AsyncIterator`.

## How does it look?

**TODO**

## Quick examples

```ts
import {tqdm, TqdmProgress} from 'node-console-progress-bar-tqdm';

// Array as Iterable with length
for (const item: number of tqdm([1, 2, 3, 4, 5])) {
    doSomeWorkOn(item);
}

// Number generates range
for (const idx: number of tqdm(100_000)) {
    doSomeWorkOn(idx);
}

// Generator as Iterable without length
const inp1: Generator<Item> = itemGenerator();
for (const item: Item of tqdm(inp1)) {
    doSomeWorkOn(item);
}

// AsyncGenerator as AsyncIterable
const inp2: AsyncGenerator<Item> = itemAsyncGenerator();
for await (const item: Item of tqdm(inp2, {total: 100})) {
    doSomeWorkOn(item);
}

// Progress bar without using in a loop directly
const pb = new TqdmProgress({
    total: items.length,
    progressColor: '#f1d3c4',
});
items.forEach((item) => {
    pb.update();
    doSomeWorkOn(item);
});
pb.render(true);
```

## Installation

```shell
npm install --save node-console-progress-bar-tqdm
yarn add node-console-progress-bar-tqdm
pnpm install node-console-progress-bar-tqdm
```

## Examples

| File | Title | Description | Tags |
| ---- | ----- | ----------- | ---- |
| [basic.cjs](example/examples/basic.cjs) | Basic example | Iterate over an array without any options | `CJS`, `Array`, `defaults` |
| [generator.mjs](example/examples/generator.mjs) | Generator examples | A couple of examples where we iterate over generator | `ESM`, `Generator`, `with/without total` |
| [unit-scaling.cjs](example/examples/unit-scaling.cjs) | Unit scaling, range iteration | Example with iteration over number range defined by `total` with unit scaling (k,M,G,T) | `CJS`, `units`, `unit scaling` |
| [custom-progress-bar.mts](example/examples/custom-progress-bar.mts) | Custom progress style | Fully customized progress bar written on TypeScript | `TS`, `Generator`, `units`, `color`, `styling`, `max width` |
| [sync-iterator-input.mts](example/examples/sync-iterator-input.mts) | Iteration over sync iterator | Example with Iterator and Iterable as input | `TS`, `Iterator`, `Iterable`, `color`, `styling` |
| [async-iterator-input.mts](example/examples/async-iterator-input.mts) | Iteration over async iterator | Example with AsyncIterator and AsyncIterable as input | `TS`, `async`, `for/await`, `AsyncIterator`, `AsyncIterable`, `color`, `styling` |
| [progress-with-no-iteration.cjs](example/examples/progress-with-no-iteration.cjs) | Using progress bar directly | There is no iteration over tqdm iterator, direct TqdmProgress usage. Progress split to 2 parts | `CJS`, `TqdmProgress`, `flush output`, `resuming`, `color` |
| [direct-iteration.mts](example/examples/direct-iteration.mts) | Direct usage of Tqdm class | Very advanced example with direct Tqdm usage | `TS`, `async`, `async/await`, `Generator`, `AsyncGenerator`, `no loop`, `units`, `color`, `styling` |
