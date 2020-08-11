import unified from 'unified'
import parse from 'reorg-parse'

export = unified().use(parse).freeze()
