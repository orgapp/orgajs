/** @type {Map<string, unkown>} */
const importCache = new Map()

/**
 * @template Type
 * @param {string} packageName
 * @returns {Promise<Type>}
 */
async function cachedImport(packageName) {
  if (importCache.has(packageName)) {
    return importCache.get(packageName)
  }
  const importedPackage = await import(packageName)
  return importedPackage
}

exports.cachedImport = cachedImport
