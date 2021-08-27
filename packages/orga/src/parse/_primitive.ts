import { Primitive } from '../types'

export default (value: string): Primitive => {
  const num = Number(value)
  if (!Number.isNaN(num)) return num
  if (value.toLowerCase() === 'true') return true
  if (value.toLowerCase() === 'false') return false
  return value
}
