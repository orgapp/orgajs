import { createProcessor, ProcessorOptions } from '@orgajs/orgx'
import { getOptions } from 'loader-utils'
import Report from 'vfile-reporter'

export async function loader(source: string, callback) {
  console.log('---very beginning')
  const options: Partial<ProcessorOptions> = getOptions(this)

  const processor = createProcessor(options)

  console.log('entering try')

  try {
    console.log('before process')
    const file = await processor.process({
      contents: source,
      path: this.resourcePath,
    })
    console.log('after process')
    callback(null, `${file}`)
    console.log('after callback')
  } catch (error) {
    console.log('in catch')
    return callback(Report(error))
  }
}
