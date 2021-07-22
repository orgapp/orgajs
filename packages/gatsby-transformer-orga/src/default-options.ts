import path from 'path'

const defaultOptions = {
  slug: ({ export_file_name }) => path.resolve('/', export_file_name || ''),
}

export default (options) => {
  return {
    ...defaultOptions,
    ...options,
  }
}
