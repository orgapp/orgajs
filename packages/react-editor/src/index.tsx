import { EditorState } from '@codemirror/state'
import { makeEditor } from '@orgajs/editor'
import { useEffect, useRef, useState } from 'react'

export function Editor({
	content = '',
	className,
	onChange
}: {
	content?: string
	className?: string
	onChange?: (value: string) => void
}) {
	const container = useRef(null)
	const [state, setState] = useState<EditorState | null>(null)

	useEffect(() => {
		if (!container.current) return

		makeEditor({
			target: container.current,
			content,
			onChange: (s) => {
				setState(s)
				onChange?.(s.doc.toString())
			}
		})
	}, [container])

	return <div className={className} ref={container}></div>
}
