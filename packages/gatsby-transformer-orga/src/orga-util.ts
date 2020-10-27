import _ from 'lodash/fp'
import { parse, Document, Section } from 'orga'
import { Node } from 'unist'

const shouldBeArray = (key: string) => [`keywords`, `tags`].includes(key)

// TODO: open this up once this is resolved:
// https://github.com/DefinitelyTyped/DefinitelyTyped/issues/27194
// @ts-ignore
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

export const getAST = async ({ node, cache }): Promise<Document | Section> => {
  const cacheKey = astCacheKey(node)
  const cachedAST = await cache.get(cacheKey)
  if (cachedAST) {
    return cachedAST as Document | Section
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

async function getOrgAST(node): Promise<Document> {
  return new Promise(resolve => {
    const ast = parse(node.internal.content)
    resolve(ast)
  })
}

export const cacheAST = ({ node, cache, ast }) => {
  const cacheKey = astCacheKey(node)
  cache.set(cacheKey, ast)
}
