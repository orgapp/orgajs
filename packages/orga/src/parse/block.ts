import { Action, Handler } from './index.js'
import { BlockBegin, BlockEnd } from '../types.js'

const block: Action = (begin: BlockBegin, ctx): Handler => {
	ctx.save()
	const contentStart = begin.position.end
	const blockName = begin.name.toLowerCase()

	const block = ctx.enter({
		type: 'block',
		name: begin.name,
		params: begin.params,
		value: '',
		attributes: { ...ctx.attributes },
		children: []
	})
	ctx.attach(ctx.lexer.eat())

	/*
	 * find the indentation of the block and apply it to
	 * the rest of the block.
	 *
	 * The indentation of the first non-blank line is used as standard.
	 * The following lines use the lesser one between its own
	 * indentation and the standard. Leading and trailing blank lines
	 * are omitted.
	 */
	const align = (content: string) => {
		let indent = -1
		return content
			.trimEnd()
			.split('\n')
			.map((line) => {
				const _indent = line.search(/\S/)
				if (indent === -1) {
					indent = _indent
				}
				if (indent === -1) return ''
				let result = line.substring(Math.min(_indent, indent))

				// remove escaping char ,
				if (block.name.toLowerCase() === 'src' && block.params[0] === 'org') {
					result = result.replace(/^(\s*),/, '$1')
				}
				return result
			})
			.join('\n')
			.trim()
	}

	return {
		name: 'block',
		rules: [
			{
				test: 'block.end',
				action: (token: BlockEnd, context) => {
					const lexer = context.lexer
					if (token.name.toLowerCase() !== blockName) return 'next'
					block.value = align(
						lexer.substring({
							start: contentStart,
							end: token.position.start
						})
					)
					context.attach(lexer.eat())
					context.exit('block')
					return 'break'
				}
			},
			{
				test: ['stars', 'EOF'],
				action: (_, context) => {
					context.restore()
					context.lexer.modify((t) => ({
						type: 'text',
						value: context.lexer.substring(t.position),
						position: t.position
					}))
					return 'break'
				}
			},
			{ test: 'newline', action: (_, { discard }) => discard() },
			{ test: /./, action: (_, { consume }) => consume() }
		]
	}
}

export default block
