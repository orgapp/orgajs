import { ReactNode, useEffect, useMemo, useState } from 'react'
import { VFile } from 'vfile'
import { evaluate } from '@orgajs/orgx'
import * as runtime from 'react/jsx-runtime'
import { map } from 'unist-util-map'
import { JSEditor, OrgEditor } from './_components'
import initContent from './_snippets/hey.org?raw'

const tabs = ['Rendered', 'Oast (Org-mode)', 'Hast (HTML)', 'JSX Code']

export default function Playground() {
	const [content, setContent] = useState<string>(initContent)
	const [parsed, setParsed] = useState({
		oast: '',
		hast: '',
		jsx: '',
		preview: <div>rendering...</div>
	})
	const [activeTab, setActiveTab] = useState(0)

	const showPosition = false

	const code = useMemo(() => {
		switch (activeTab) {
			case 1:
				return parsed.oast
			case 2:
				return parsed.hast
			case 3:
				return parsed.jsx
			default:
				return ''
		}
	}, [activeTab, parsed])

	useEffect(() => {
		const url = new URL(window.location.href)
		const text = url.searchParams.get('text')
		if (text) {
			setContent(decodeURIComponent(text))
		}
	}, [])

	useEffect(() => {
		render(content).then(setParsed)
	}, [content])

	return (
		<div className="flex h-full w-full">
			{/* Editor panel */}
			<div className="h-full w-1/2 border-1 border-gray-600">
				<OrgEditor
					className="h-full"
					content={content}
					onChange={(state) => setContent(state.doc.toString())}
				/>
			</div>

			{/* Preview panel */}
			<div className="h-full w-1/2 flex flex-col">
				<ul className="tabs tabs-border">
					{tabs.map((tab, i) => (
						<input
							key={`tab-${i}`}
							type="radio"
							name="tabs"
							className="tab"
							aria-label={tab}
							onChange={() => setActiveTab(i)}
							checked={activeTab === i}
						/>
					))}
				</ul>
				<div className="h-full overflow-auto">
					<div className={`p-4 ${activeTab === 0 ? 'block' : 'hidden'}`}>
						{parsed.preview}
					</div>
					<div className={activeTab === 0 ? 'hidden' : 'block'}>
						<JSEditor>{code}</JSEditor>
					</div>
				</div>
				<div className="menu lg:menu-horizontal rounded-box w-full justify-end">
					<li>
						<button onClick={generateLink}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								height="24px"
								viewBox="0 -960 960 960"
								width="24px"
								fill="#e3e3e3"
							>
								<path d="M440-280H280q-83 0-141.5-58.5T80-480q0-83 58.5-141.5T280-680h160v80H280q-50 0-85 35t-35 85q0 50 35 85t85 35h160v80ZM320-440v-80h320v80H320Zm200 160v-80h160q50 0 85-35t35-85q0-50-35-85t-85-35H520v-80h160q83 0 141.5 58.5T880-480q0 83-58.5 141.5T680-280H520Z" />
							</svg>
							Generate Link
						</button>
					</li>
				</div>
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
		let oast = ''
		let hast = ''
		let jsx = ''

		const { default: Content } = await evaluate(file, {
			...runtime,
			rehypePlugins: [capture((v) => (oast = toJSON(v)))],
			reorgPlugins: [capture((v) => (hast = toJSON(v)))]
		})

		jsx = String(file)
		return {
			oast,
			hast,
			jsx,
			preview: (
				<div className="prose h-full overflow-auto">
					<Content />
				</div>
			)
		}
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
}
