import unified from 'unified'
import parse from '@orgajs/reorg-parse'

export = unified().use(parse).freeze()
