const path = require('path')
const _ = require('lodash/fp')

const createPages = ({
  basePath,
  createPage,
  posts,
  pagination,
  component,
  context,
}) => {

  if (!pagination) {
    createPage({
      path: basePath,
      component,
      context: { ids: posts.map(_.get('id')), ...context }
    })
    return
  }

  const pages = _.chunk(pagination)(posts)

  const getLink = (i) => {
    if (i >= pages.length || i < 0) return undefined
    return path.resolve(basePath, `${i + 1}`)
  }

  pages.forEach((posts, i) => {
    createPage({
      path: getLink(i),
      component,
      context: {
        ids: posts.map(p => p.id),
        currentPage: i + 1,
        next: getLink(i + 1),
        prev: getLink(i - 1),
        ...context,
      },
    })

    if (i === 0) {
      createPage({
        path: basePath,
        component,
        context: {
          ids: posts.map(p => p.id),
          currentPage: i + 1,
          next: getLink(i + 1),
          prev: getLink(i - 1),
          ...context,
        },
      })
    }
  })

}

module.exports = createPages
