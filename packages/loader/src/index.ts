import reorg from '@orgajs/reorg'
import { getOptions } from 'loader-utils'
import Report from 'vfile-reporter'

export default function (source) {
  const { plugins = [] } = getOptions(this)

  const processor = reorg()
  for (const item of plugins) {
    if (Array.isArray(item)) {
      const [plugin, pluginOptions] = item
      processor.use(plugin, pluginOptions)
    } else {
      processor.use(item)
    }
  }

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
        // console.log(`--- jsx code ---`)
        // console.dir(code)
        callback(null, code)
      }
    )
  } catch (error) {
    return callback(error)
  }
}
