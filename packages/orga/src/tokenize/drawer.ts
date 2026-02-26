import type { Reader } from 'text-kit'
import type { Token } from '../types.js'

export default (reader: Reader): Token[] => {
	const { match, jump, eat } = reader
	const ws = eat('whitespaces')

	const drawerReg = /:(\w+):(?=[ \t]*$)/my
	const m = match(drawerReg)
	if (m) {
		jump(m.position.end)
		const name = m.result[1]
		eat('whitespaces')
		if (name.toLowerCase() === 'end') {
			return [
				{
					type: 'drawer.end',
					position: m.position
				}
			]
		} else {
			return [
				{
					type: 'drawer.begin',
					name,
					position: m.position
				}
			]
		}
	}

	ws && jump(ws.position.start)
	return []
}
