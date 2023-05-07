import { unified } from 'unified'
import parse from '@orgajs/reorg-parse'

export const reorg = unified().use(parse).freeze()
