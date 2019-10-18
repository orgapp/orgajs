import _ from 'lodash/fp'
import { Parser } from 'orga'
import { selectAll } from 'unist-util-select'

export const getProperties = headline => {
  const drawer = selectAll(`drawer`, headline).find(d => d.name === `PROPERTIES`)
  if (!drawer) return {}
  const regex = /\s*:(.+):\s*(.+)\s*$/

  return drawer.value.split(`\n`).reduce((accu, current) => {
    const m = current.match(regex)
    return { ...accu, [m[1].toLowerCase()]: m[2] }
  }, {})
}

const shouldBeArray = (key: string) => [`keywords`].includes(key)

export const processMeta = _.mapValues.convert({ cap: false })((v, k) => {
  if (shouldBeArray(k) && typeof v === `string`) {
    return v.match(/[^ ]+/g)
  }
  return v
})

export const sanitise = (title: string) => {
  return title.replace(/\s+/g, '-').replace(/[^a-z0-9-]/gi, '').toLowerCase()
}

const astCacheKey = node =>
      `transformer-orga-ast-${
    node.internal.contentDigest
  }`

const ASTPromiseMap = new Map()

export const getAST = async ({ node, cache }) => {
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

export const cacheAST = ({ node, cache, ast }) => {
  const cacheKey = astCacheKey(node)
  cache.set(cacheKey, ast)
}
