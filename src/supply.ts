import {EOL} from 'node:os';
import tty from 'node:tty';
import {hasFd} from './utils';

const defaultTerminalColumns = 80;

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

export class TqdmWriteStream {
    readonly resetLine: () => void;

    constructor(
        private readonly stream: NodeJS.WritableStream | tty.WriteStream,
        forceTerminal = false,
    ) {
        this.resetLine = this.generalResetLine;

        if (stream instanceof tty.WriteStream && hasFd(stream) && tty.isatty(stream.fd)) {
            this.resetLine = this.ttyResetLine;
            process.once('SIGWINCH', this.onTerminalResize);
        } else if (forceTerminal) {
            this.resetLine = this.forceTerminalResetLine;
        }
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
            stream.write('\x1B[2J');
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
        // ANSI/VT100 codes: https://bash-hackers.gabe565.com/scripting/terminalcodes/
        // \x1b – ESC, ^[: Start an escape sequence.
        // \x1b[ – ESC + [.
        // 0G – Move cursor to the 0th column of the current row.
        // K – Clear string from the cursor position to the end of line.
        this.stream.write('\x1b[0G\x1b[K');
    };

    private generalResetLine = () => {
        this.stream.write(EOL);
    };
}
