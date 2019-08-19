const moment = require('moment')
const { selectAll } = require('unist-util-select')
const { Parser, parseTimestamp } = require('orga')

const getProperties = headline => {
  const drawer = selectAll(`drawer`, headline).find(d => d.name === `PROPERTIES`)
  if (!drawer) return {}
  const regex = /\s*:(.+):\s*(.+)\s*$/

  return drawer.value.split(`\n`).reduce((accu, current) => {
    let m = current.match(regex)
    return { ...accu, [m[1].toLowerCase()]: m[2] }
  }, {})
}

const shouldBeArray = key => [`tags`, `keywords`].includes(key)

const cleanup = str => {
  if (typeof str !== `string`) return str
  return str.trim().replace(/[<>\[\]]/g, '')
}

function tryToParseTimestamp(str) {
  let m = moment(cleanup(str), [
    `YYYY-MM-DD ddd HH:mm`,
    `YYYY-MM-DD ddd`,
    `YYYY-MM-DD`], true)
  return m.isValid() ? m.toDate() : str
}

const processMeta = settings => {
  return Object.keys(settings).reduce((result, k) => {
    if (shouldBeArray(k) && typeof settings[k] === `string`)
      return { ...result, [k]: settings[k].match(/[^ ]+/g) }

    // parse date
    return { ...result, [k]: tryToParseTimestamp(settings[k])}
  }, settings)
}


const sanitise = title => {
  return title.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase()
}

const astCacheKey = node =>
      `transformer-orga-ast-${
    node.internal.contentDigest
  }`

const ASTPromiseMap = new Map()

const getAST = async ({ node, cache }) => {
  const cacheKey = astCacheKey(node)
  const cachedAST = await cache.get(cacheKey)
  if (cachedAST) {
    return cachedAST
  }
  if (ASTPromiseMap.has(cacheKey)) return await ASTPromiseMap.get(cacheKey)
  const ASTGenerationPromise = getOrgAST(node)
  ASTGenerationPromise.then(ast => {
    cache.set(cacheKey, ast)
    ASTPromiseMap.delete(cacheKey)
  }).catch(err => {
    ASTPromiseMap.delete(cacheKey)
    return err
  })

  // Save new AST to cache and return
  // We can now release promise, as we cached result
  ASTPromiseMap.set(cacheKey, ASTGenerationPromise)
  return ASTGenerationPromise
}

async function getOrgAST(node) {
  return new Promise(resolve => {
    const parser = new Parser()
    const ast = parser.parse(node.internal.content)
    resolve(ast)
  })
}

const cacheAST = ({ node, cache, ast }) => {
  const cacheKey = astCacheKey(node)
  cache.set(cacheKey, ast)
}

module.exports = {
  getProperties,
  processMeta,
  sanitise,
  getAST,
  cacheAST,
}
