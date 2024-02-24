import {EOL} from 'node:os';
import tty from 'node:tty';
import {IAsyncIteratorContainer, ISyncIteratorContainer} from './base-types';
import {getTermClearScreen, getTermReturnToLineStart} from './term';
import {hasFd} from './utils';

const defaultTerminalColumns = 80;

export class NumericIterator implements Iterator<number> {
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

export class SyncResultIterator<TItem> implements Iterator<TItem> {
    constructor(private readonly container: ISyncIteratorContainer<TItem>) {}

    next(): IteratorResult<TItem> {
        return this.container.nextSync();
    }
}

export class AsyncResultIterator<TItem> implements AsyncIterator<TItem> {
    constructor(private readonly container: IAsyncIteratorContainer<TItem>) {}

    next(): Promise<IteratorResult<TItem>> {
        return this.container.nextAsync();
    }
}

export class TqdmWriteStream {
    readonly resetLine: () => void;
    private readonly streamIsTty: boolean;

    constructor(
        private readonly stream: NodeJS.WritableStream | tty.WriteStream,
        forceTerminal = false,
    ) {
        this.resetLine = this.generalResetLine;

        this.streamIsTty = stream instanceof tty.WriteStream && hasFd(stream) && tty.isatty(stream.fd);
        if (this.streamIsTty) {
            this.resetLine = this.ttyResetLine;
            process.once('SIGWINCH', this.onTerminalResize);
        } else if (forceTerminal) {
            this.resetLine = this.forceTerminalResetLine;
        }
    }

    get isTty(): boolean {
        return this.streamIsTty;
    }

    get columns(): number {
        const stream = this.getStreamAsTty();
        if (stream) {
            return stream.columns;
        }
        return defaultTerminalColumns;
    }

    write(chunk: string) {
        this.stream.write(chunk);
    }

    finalize() {
        process.off('SIGWINCH', this.onTerminalResize);
        this.stream.write(EOL);
    }

    clearScreen() {
        const stream = this.getStreamAsTty();
        if (stream) {
            stream.write(EOL);
            stream.write(getTermClearScreen());
            stream.cursorTo(0, 0);
        }
    }

    private onTerminalResize = () => {
        this.clearScreen();
        process.once('SIGWINCH', this.onTerminalResize);
    };

    private getStreamAsTty() {
        if (this.stream instanceof tty.WriteStream) {
            return this.stream;
        }
        return null;
    }

    private ttyResetLine = () => {
        const stream = this.getStreamAsTty();
        if (stream) {
            stream.clearLine(0);
            stream.cursorTo(0);
        } else {
            this.forceTerminalResetLine();
        }
    };

    private forceTerminalResetLine = () => {
        this.stream.write(getTermReturnToLineStart());
    };

    private generalResetLine = () => {
        this.stream.write(EOL);
    };
}
