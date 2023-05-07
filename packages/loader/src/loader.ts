import { createProcessor, ProcessorOptions } from '@orgajs/orgx'
import { getOptions } from 'loader-utils'
import path from 'path'

export async function loader(source: string, callback) {
  const options: Partial<ProcessorOptions> = getOptions(this)
  const processor = createProcessor(options)

  try {
    const file = await processor.process({
      value: source,
      path: this.resourcePath,
    })
    callback(null, file.value, file.map)
  } catch (error) {
    const fpath = path.relative(this.context, this.resourcePath)
    error.message = `${fpath}:${error.name}: ${error.message}`
    callback(error)
  }
}
