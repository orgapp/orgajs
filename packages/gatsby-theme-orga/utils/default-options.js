const path = require('path')

const defaultOptions = {
  contentPath: 'content',
  filter: () => true,
  pagination: 0,
  columns: 2,
  indexPath: '/',
  imageMaxWidth: 1380,
  categoryIndexPath: category => `/${category}`,
  tagIndexPath: tag => `/:${tag}:`,
  postPath: ({ category, export_file_name }) =>
    path.resolve('/', category || '', export_file_name || ''),
}

module.exports = options => {
  return {
    ...defaultOptions,
    ...options,
  }
}
