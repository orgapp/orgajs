import { EditorState } from '@codemirror/state'
import { makeEditor } from '@orgajs/editor'
import { useEffect, useRef, useState } from 'react'

export function Editor({
	className,
	children
}: {
	className?: string
	children: string
}) {
	const container = useRef(null)
	const [state, setState] = useState<EditorState | null>(null)

	useEffect(() => {
		if (!container.current) return

		makeEditor({
			target: container.current,
			content: children,
			onChange: (s) => setState(s)
		})
	}, [container, children])

	return <div className={className} ref={container}></div>
}
