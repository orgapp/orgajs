import type { Reader } from 'text-kit'
import type { Token } from '../types.js'

export default ({ match, eat, jump }: Reader): Token | undefined => {
	const ws = eat('whitespaces')
	if (match(/^#\s/y)) {
		const comment = match(/^#\s+(.*)$/my)
		if (comment) {
			eat('line')
			return {
				type: 'comment',
				position: comment.position,
				value: comment.result[1]
			}
		}
	}
	ws && jump(ws.position.start)
}
