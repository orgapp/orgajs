import { createProcessor, ProcessorOptions } from '@orgajs/orgx'
import { getOptions } from 'loader-utils'
import Report from 'vfile-reporter'

export type { ProcessorOptions }

export default function (source) {
  const options: Partial<ProcessorOptions> = getOptions(this)

  const processor = createProcessor(options)

  const callback = this.async()

  try {
    processor.process(
      {
        contents: source,
        path: this.resourcePath,
      },
      (error, file) => {
        if (error) {
          callback(Report(error))
          return
        }

        const code = `${file}`
        // console.dir(code)
        callback(null, code)
      }
    )
  } catch (error) {
    return callback(error)
  }
}
