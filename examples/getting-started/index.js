import { reorg } from '@orgajs/reorg'
import stream from 'unified-stream'
import mutate from '@orgajs/reorg-rehype'
import html from 'rehype-stringify'

const processor = reorg().use(mutate).use(html)

process.stdin.pipe(stream(processor)).pipe(process.stdout)
