const stream = require('unified-stream')
const orga = require('orga-unified')
const mutate = require('orga-unified-rehype')
const html = require('rehype-stringify')

const processor = orga()
      .use(mutate)
      .use(html)

process.stdin.pipe(stream(processor)).pipe(process.stdout)
