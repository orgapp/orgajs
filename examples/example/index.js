const unified = require('unified')
const stream = require('unified-stream')
const parse = require('orga-unified')
const mutate = require('orga-rehype')
const html = require('rehype-stringify')

const processor = unified()
      .use(parse)
      .use(mutate)
      .use(html)

process.stdin.pipe(stream(processor)).pipe(process.stdout)
