import type { ProcessorOptions } from '@orgajs/orgx'
import { loader } from './loader'

export type { ProcessorOptions }

export default async function (source: string) {
  const callback = this.async()
  return await loader.call(this, source, callback)
}
