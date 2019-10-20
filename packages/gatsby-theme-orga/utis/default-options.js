const toArray = value => {
  if (!value || Array.isArray(value)) return value
  return [`${value}`]
}

module.exports = options => {
  return {
    basePath: options.basePath || `/`,
    contentPath: options.contentPath || `content`,
    filter: options.filter || {},
    pagination: options.pagination || 10,
    slug: toArray(options.slug) || ['$category', '$export_file_name'],
    buildIndexPage: options.buildIndexPage || true,
    buildCategoryIndexPage: options.buildCategoryIndexPage || true,
    metadata: options.metadata || ['title', 'category'],
    sortBy: toArray(options.sortBy) || [`date`],
    order: options.order || `DESC`,
  }
}
