const URL_PATTERN = /(?:([a-z][a-z0-9+.-]*):)?(.*)/i

interface LinkInfo {
  protocol: string
  value: string
  search?: string | number
}

const isFilePath = (str: string): boolean => {
  return str && /^\.{0,2}\//.test(str)
}

export default (link: string): LinkInfo | undefined => {
  const m = URL_PATTERN.exec(link)
  if (!m) return undefined
  const protocol = (
    m[1] || (isFilePath(m[2]) ? `file` : `internal`)
  ).toLowerCase()
  let value = m[2]
  if (/https?/.test(protocol)) {
    value = `${protocol}:${value}`
  }
  let search: string | number | undefined
  if (protocol === 'file') {
    const m = /(.*?)::(.*)/.exec(value)
    if (m && m[1] && m[2]) {
      value = m[1]
      search = parseInt(m[2])
      search = Number.isInteger(search) ? search : m[2]
    }
  }
  return { protocol, value, search }
}
