const stream = require('unified-stream')
const reorg = require('@orgajs/reorg')
const mutate = require('@orgajs/reorg-rehype')
const html = require('rehype-stringify')

const processor = reorg()
      .use(mutate)
      .use(html)

process.stdin.pipe(stream(processor)).pipe(process.stdout)
