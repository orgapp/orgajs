import type { Reader } from 'text-kit'
import type { Token } from '../types.js'

export default ({ eat }: Reader): Token | undefined => {
	const hr = eat(/^\s*-{5,}\s*$/my)
	if (hr) {
		return {
			type: 'hr',
			position: hr.position
		}
	}
}
