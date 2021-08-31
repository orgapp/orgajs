/* eslint-disable @typescript-eslint/no-var-requires */
const _ = require('lodash')
const path = require('path')

exports.createIndexPage = ({
  items,
  createPage,
  pageLength = 10,
  component,
  basePath,
}) => {
  const max = pageLength > 0 ? pageLength : items.length
  const numPages = Math.ceil(items.length / max)

  const getPath = (index) => {
    if (index === 0) return basePath
    return path.posix.join(...[basePath, `${index}`])
  }

  _.chunk(items, max).forEach((posts, i) => {
    createPage({
      path: getPath(i),
      component,
      context: {
        posts: posts.map((p) => p.node),
        limit: max,
        skip: i * max,
        prev: i === 0 ? undefined : getPath(i - 1),
        next: i < numPages - 1 ? getPath(i + 1) : undefined,
      },
    })
  })
}

exports.createPages = ({ items, createPage, getPath, getId, component }) => {
  items.forEach(({ node }) => {
    createPage({
      path: getPath(node),
      component,
      context: {
        id: getId(node),
        ...node,
      },
    })
  })
}
