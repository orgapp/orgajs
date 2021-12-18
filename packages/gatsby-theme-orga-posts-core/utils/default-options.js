const path = require('path')

const defaultOptions = {
  contentPath: 'content',
  filter: () => true,
  pagination: 0,
  columns: 2,
  indexPath: '/',
  imageMaxWidth: 1380,
  listImageWidth: 200,
  listImageHeight: 134,
  categoryIndexPath: (category) => `/${category}`,
  tagIndexPath: (tag) => `/:${tag}:`,
  slug: ({ export_file_name }) => path.resolve('/', export_file_name || ''),
  postRedirect: () => [],
}

module.exports = (options) => {
  return {
    ...defaultOptions,
    ...options,
  }
}
