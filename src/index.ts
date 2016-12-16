import { Server, createServer, IncomingMessage, ServerResponse} from 'http'
import { EventEmitter } from 'events'
import * as icy from 'icy'
import * as lame from 'lame'
import * as url from 'url'

const CHANNELS = 2
const SAMPLE_SIZE = 16
const SAMPLE_RATE = 44100
const META_INTERVAL = 8192

function removeValueFromArray<T>(array: T[], value: T) {
    const index = array.indexOf(value)
    if (index >= 0) {
        array.splice(index, 1)
    }
}

export class Nicercast {

    _server: Server
    _inputStream: EventEmitter
    _metadata: string
    _listenStreams = []
    _metadataStreams = []

    constructor(inputStream: EventEmitter, metadata = 'Nicercast') {

        this._server = createServer(this._handleRequest.bind(this))
        this._inputStream = inputStream
        this._metadata = metadata

    }

    _handleRequest(req: IncomingMessage, res: ServerResponse) {
        switch (req.url) {
            case '/':
            case '/listen.m3u':
                if (req.method === 'GET') {
                    this._playlist(req, res)
                } else {
                    res.writeHead(405)
                    res.end('Method not allowed')
                }

                break
            case '/listen':
                if (req.method === 'GET') {
                    this._listen(req, res)
                } else {
                    res.writeHead(405)
                    res.end('Method not allowed')
                }

                break
            default:
                res.writeHead(404)
                res.end('Not found')
        }
    }

    _playlist(req: IncomingMessage, res: ServerResponse) {
        const urlProps = {
            protocol: 'http',
            pathname: '/listen',
        }

        if (req.headers.host) {
            urlProps.host = req.headers.host
        } else {
            const info = req.socket.address()
            urlProps.hostname = info.address
            urlProps.port = info.port
        }

        res.writeHead(200, { 'Content-Type': 'audio/x-mpegurl' })
        res.end(url.format(urlProps))
    }

    _listen(req: IncomingMessage, res: ServerResponse) {
        const acceptsMetadata = (req.headers['icy-metadata'] === '1')

        res.writeHead(200, {
            Connection: 'close',
            'Content-Type': 'audio/mpeg',
            'Icy-Metaint': (acceptsMetadata ? META_INTERVAL : undefined),
        })

        let output
        if (acceptsMetadata) {
            output = new icy.Writer(META_INTERVAL)
            this._metadataStreams.push(output)
            output.queueMetadata(this._metadata)
            output.pipe(res)
        } else {
            output = res
        }

        const encoder = new lame.Encoder({
            channels: CHANNELS,
            bitDepth: SAMPLE_SIZE,
            sampleRate: SAMPLE_RATE,
        })

        this._listenStreams.push(encoder)

        function teardown() {
            removeValueFromArray(this._listenStreams, encoder)
            removeValueFromArray(this._metadataStreams, output)

            this._inputStream.unpipe(encoder)
            encoder.unpipe(output)
            encoder.end()
        }

        this._inputStream.pipe(encoder).pipe(output)
        req.socket.on('close', teardown.bind(this))
    }

    setMetadata(metadata: string) {
        this._metadata = metadata

        this._metadataStreams.forEach((stream) => {
            stream.queue(metadata)
        })
    }

    setInputStream(inputStream: EventEmitter) {
        const currentInput = this._inputStream

        this._listenStreams.forEach((stream) => {
            currentInput.unpipe(stream)
            inputStream.pipe(stream)
        })

        this._inputStream = inputStream
    }

    listen(port: number, callback: Function) {
        return this._server.listen(port, callback)
    }

    close(callback: Function) {
        this._server.close(callback)
    }

    address() {
        return this._server.address()
    }
}
