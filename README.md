# Nicercast

Simple Node.js icecast compliant streaming server.

# IMPORTANT NOTE - TYPESCRIPT FORK

This is a fork of [stephen/nicercast](https://github.com/stephen/nicercast) that @jabooth undertook for fun in Dec 2016. I moved `nicercast` and a handful of other projects to Typescript and placed them under a new namespace at [github/homeaudio](https://github.com/homeaudio/) in an effort to better understand and rapidly improve all these interrelated projects.

For now I'm maintaining my forks at [github/homeaudio](https://github.com/homeaudio/), but I would be delighted if these forks were re-unified with their original projects at some point. Given the extensive nature of the changes made though, I understand that this may be challenging for the original authors.

## Installation

```sh
npm install --save nicercast
```

## Usage

```js
import { Nicercast } from 'nicercast'

// Stream raw audio from stdin
const input = process.stdin
const server = new Nicercast(input, { metadata: 'Process Input' })

server.listen(3000, () => {
  console.log('http://localhost:3000/listen.m3u')
})
```

## API

### `new Nicercast(input[, opts])`

Creates a new Nicercast server that streams the `input` stream of raw audio
data. The optional `opts` parameter can be used to specify initial metadata, by
suppling it under the key `metadata`.

### `Nicercast#setMetadata(metadata)`

Set the current metadata to `metadata`, will be broadcasted to all current
listeners.

### `Nicercast#setInputStream(input)`

Set the current input stream to `input`, will change for all current listeners
as well.

### `Nicercast#listen(port[, hostname][, backlog][, cb])`

Start listening on the specified `port`.

### `Nicercast#close([cb])`

Stop listening.
