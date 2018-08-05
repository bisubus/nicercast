declare module 'lame' {
    import * as stream from 'stream';

    export class Encoder extends stream.Transform {
        constructor(opts?: { [s: string]: any });
    }
}
