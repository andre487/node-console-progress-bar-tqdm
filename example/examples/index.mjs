import basic from './basic.cjs';
import generator from './generator.mjs';
import unitScaling from './unit-scaling.cjs';
import custom from './custom-progress-bar.mjs';
import progressBar from './progress-with-no-iteration.cjs';
import direct from './direct-iteration.mjs';
import syncIt from './sync-iterator-input.mjs';
import asyncIt from './async-iterator-input.mjs';

export default [
    basic,
    generator,
    unitScaling,
    custom,
    syncIt,
    asyncIt,
    progressBar,
    direct,
];
