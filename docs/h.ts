type Child = string | Node
type Attributes = {
	onclick?: (e: MouseEvent) => void
}

function isChild(x: any): x is Child {
	return typeof x === 'string' || x instanceof Node
}

export function h(selector: string, attr?: Attributes): HTMLElement
export function h(
	selector: string,
	attr: Attributes,
	...children: Child[]
): HTMLElement
export function h(selector: string, ...children: Child[]): HTMLElement

export function h(
	selector: string,
	attributes: Attributes | Child | undefined = undefined,
	...children: (string | Node)[]
) {
	const parts = selector.split(/([#.])/)
	const tag = parts[0] || 'div'
	let id = null
	const classes = []

	for (let i = 1; i < parts.length; i += 2) {
		if (parts[i] === '#') {
			id = parts[i + 1]
		} else if (parts[i] === '.') {
			classes.push(parts[i + 1])
		}
	}
	const e = document.createElement(tag)
	if (id) e.setAttribute('id', id)
	if (classes.length) e.setAttribute('class', classes.join(' '))

	if (attributes) {
		if (isChild(attributes)) {
			children.unshift(attributes)
		} else {
			if (attributes.onclick) {
				e.onclick = attributes.onclick
			}
		}
	}

	for (const child of children) {
		if (typeof child === 'string') {
			e.appendChild(document.createTextNode(child))
		} else if (child) {
			e.appendChild(child)
		}
	}
	return e
}
