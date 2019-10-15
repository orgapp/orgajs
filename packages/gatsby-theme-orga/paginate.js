exports.paginate = ({
  items,
  createPage,
  pageLength = 10,
  component,
  basePath,
}) => {
  const numPages = Math.ceil(items.length / pageLength)

  const getPath = index => {
    if (index === 0) return basePath
    return `${basePath}/${index}`
  }

  Array.from({ length: numPages }).forEach((_, i) => {
    createPage({
      path: getPath(i),
      component,
      context: {
        ids: items.map(i => i.node.id),
        limit: pageLength,
        skip: i * pageLength,
        prev: i === 0 ? undefined : getPath(i - 1),
        next: i < numPages  - 1 ? getPath(i + 1) : undefined,
      },
    })
  })
}

exports.createPages = ({
  items,
  createPage,
  getPath,
  getId,
  component,
}) => {
  items.forEach(({ node }) => {
    createPage({
      path: getPath(node),
      component,
      context: {
        id: getId(node),
      },
    })
  })
}
