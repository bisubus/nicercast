declare module 'icy' {
    import * as stream from 'stream';

    export class Writer extends stream.Transform {
        constructor(metaint: number, opts?: { [s: string]: any });
        queue(metadata: string | { StreamTitle: string }): void;
    }
}
