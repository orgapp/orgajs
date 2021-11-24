// Scheme: https://tools.ietf.org/html/rfc3986#section-3.1
// Absolute URL: https://tools.ietf.org/html/rfc3986#section-4.3
const ABSOLUTE_URL_REGEX = /^[a-zA-Z][a-zA-Z\d+\-.]*?:/

// Windows paths like `c:\`
const WINDOWS_PATH_REGEX = /^[a-zA-Z]:\\/

export const isAbsoluteUrl = (url: string) => {
  if (WINDOWS_PATH_REGEX.test(url)) {
    return false
  }

  return ABSOLUTE_URL_REGEX.test(url)
}

export const isRelativeUrl = (url: string) => !isAbsoluteUrl(url)
