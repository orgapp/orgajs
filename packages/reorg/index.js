import parse from '@orgajs/reorg-parse'
import { unified } from 'unified'

export const reorg = unified().use(parse).freeze()
