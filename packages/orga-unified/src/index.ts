import unified from 'unified'
import parse from 'orga-unified-parse'

export = unified().use(parse).freeze()
