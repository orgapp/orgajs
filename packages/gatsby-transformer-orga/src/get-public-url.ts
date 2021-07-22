import { join } from 'path'

export = function (_ref) {
  const file = _ref.file,
    _ref$pathPrefix = _ref.pathPrefix,
    pathPrefix = _ref$pathPrefix === undefined ? '' : _ref$pathPrefix

  const fileName = file.name + '-' + file.internal.contentDigest + file.ext
  const publicPath = join(process.cwd(), 'public', 'static', fileName)
  return pathPrefix + '/static/' + fileName
}
