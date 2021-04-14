import unified from 'unified'
import parse from '@orgajs/reorg-parse'

export default unified().use(parse).freeze()
