const path = require(`path`)

module.exports = ({ file, pathPrefix = `` }) => {
  const fileName = `${file.name}-${file.internal.contentDigest}${
          file.ext
        }`
  const publicPath = path.join(
    process.cwd(),
    `public`,
    `static`,
    fileName
  )
  return `${pathPrefix}/static/${fileName}`
}
