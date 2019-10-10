const URL_PATTERN = /(?:([a-z][a-z0-9+.-]*):)?(.*)/

export default (link: string) => {
  const result = { raw: link, protocol: undefined, location: undefined }
  const m = URL_PATTERN.exec(link)
  if (!m) return result
  result.protocol = (m[1] || (isFilePath(m[2]) ? `file` : `internal`)).toLowerCase()
  result.location = m[2]
  return processFilePath(result)

  function isFilePath(str) {
    return str.match(/^\.{0,2}\//)
  }
}

function processFilePath(link) {
  if (link.protocol !== `file`) return link
  // const pattern = /([^:]*?)(?:::(.*))?/
  const pattern = /(.*?)::(.*)/
  const m = pattern.exec(link.location)
  if (!m) return link
  if (m[2]) {
    link.location = m[1]
    link.query = processQuery(m[2])
  }
  return link
}

function processQuery(q) {
  const ln = parseInt(q)
  if (ln) {
    return { ln }
  }
  if (q.startsWith(`*`)) {
    const headline = q.replace(/^\*+/, '')
    return { headline }
  }
  return { text: q }
}
