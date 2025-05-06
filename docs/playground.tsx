import { ReactNode, useEffect, useState } from 'react'
import { VFile } from 'vfile'
import { evaluate } from '@orgajs/orgx'
import * as runtime from 'react/jsx-runtime'
import { map } from 'unist-util-map'
import { JSEditor, OrgEditor } from './_components'
import initContent from './_snippets/hey.org?raw'

export default function Playground() {
	const [content, setContent] = useState<string>(initContent)
	const [preview, setPreview] = useState<ReactNode>(null)
	const [activeTab, setActiveTab] = useState('rendered')
	const [oast, setOast] = useState('')
	const [hast, setHast] = useState('')
	const [jsx, setJsx] = useState('')
	const showPosition = false

	useEffect(() => {
		render(content).then(setPreview)
	}, [content])

	return (
		<div className="flex h-full w-full">
			{/* Editor panel */}
			<div className="h-full w-1/2">
				<OrgEditor className="h-full" content={content} onChange={setContent} />
			</div>

			{/* Preview panel */}
			<div role="tablist" className="tabs tabs-border h-full w-1/2">
				<Tab name="rendered" label="Rendered">
					{preview}
				</Tab>
				<Tab name="oast" label="OAST (Org-mode)">
					<JSEditor>{oast}</JSEditor>
				</Tab>
				<Tab name="hast" label="HAST (HTML)">
					<JSEditor>{hast}</JSEditor>
				</Tab>
				<Tab name="jsx" label="jsx code">
					<JSEditor>{jsx}</JSEditor>
				</Tab>
			</div>
		</div>
	)

	// Generate shareable link
	function generateLink() {
		const url = new URL(window.location.href)
		const encoded = encodeURIComponent(content)
		url.searchParams.set('text', encoded)
		navigator.clipboard.writeText(url.toString())
		// This assumes window.echo is available globally
		if (typeof window.echo === 'function') {
			window.echo('Link copied to clipboard')
		} else {
			console.log('Link copied to clipboard')
		}
	}

	async function render(content: string) {
		const file = new VFile(content)

		const { default: Content } = await evaluate(file, {
			...runtime,
			rehypePlugins: [capture((v) => setHast(toJSON(v)))],
			reorgPlugins: [capture((v) => setOast(toJSON(v)))]
		})

		setJsx(String(file))

		return (
			<div className="prose h-full overflow-auto">
				<Content />
			</div>
		)
	}

	function capture(fn: (v: any) => void) {
		return function () {
			return function (tree) {
				fn(tree)
			}
		}
	}

	function toJSON(tree: any) {
		return JSON.stringify(
			map(tree, (node) => {
				const { position, ...rest } = node
				if (!showPosition) {
					return rest
				}
				return node
			}),
			null,
			2
		)
	}

	function Tab({
		name,
		label,
		children
	}: {
		name: string
		label: string
		children: ReactNode
	}) {
		return (
			<>
				<input
					key={`tab-${name}`}
					type="radio"
					name={name}
					className="tab"
					aria-label={label}
					onChange={() => setActiveTab(name)}
					checked={activeTab === name}
				/>
				<div className="tab-content h-full overflow-auto">{children}</div>
			</>
		)
	}
}
