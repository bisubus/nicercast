import { Nicercast } from '.'

// stream raw audio from stdin
const input = process.stdin
const server = new Nicercast(input)

server.listen(3000, () => {
    console.log('http://localhost:3000/listen.m3u')
})

let x = 0
setInterval(() => {
    server.setMetadata('Test Metadata ' + (x++))
}, 1000)
