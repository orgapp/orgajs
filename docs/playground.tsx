import { ReactNode, useEffect, useState } from 'react'
import { VFile } from 'vfile'
import { evaluate } from '@orgajs/orgx'
import * as runtime from 'react/jsx-runtime'
import { Editor } from '@orgajs/react-editor'
import initContent from './_snippets/hey.org?raw'

const classNames = (...classes: string[]) => classes.filter(Boolean).join(' ')

export const message = 'Playground'

const tabs = [
	{
		name: 'rendered',
		label: 'Rendered'
	},
	{
		name: 'oast',
		label: 'OAST (Org-mode)'
	},
	{
		name: 'hast',
		label: 'HAST (HTML)'
	}
]

export default function Playground() {
	const [content, setContent] = useState<string>(initContent)
	const [preview, setPreview] = useState<ReactNode>(null)
	const [activeTab, setActiveTab] = useState('rendered')

	useEffect(() => {
		render(content).then(setPreview)
	}, [content])

	return (
		<div className="flex h-full w-full">
			{/* Editor panel */}
			<div className="h-full w-1/2">
				<Editor className="h-full" content={content} onChange={setContent} />
			</div>

			{/* Preview panel */}
			<div role="tablist" className="tabs tabs-border h-full w-1/2">
				<input
					type="radio"
					name={`rendered`}
					className="tab"
					aria-label="Rendered"
					onChange={() => setActiveTab('rendered')}
					checked={activeTab === 'rendered'}
				/>

				<div className={`tab-content bg-base-100 p-6`}>{preview}</div>

				<input
					type="radio"
					name="oast"
					className="tab"
					aria-label="OAST (Org-mode)"
					onChange={() => setActiveTab('oast')}
					checked={activeTab === 'oast'}
				/>

				<div className={'tab-content p-6'}>OAST content</div>

				<input
					type="radio"
					name="hast"
					className="tab"
					aria-label="HAST (HTML)"
					onChange={() => setActiveTab('hast')}
					checked={activeTab === 'hast'}
				/>

				<div className={'tab-content p-6'}>HTML content</div>
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
			...runtime
			// rehypePlugins: [
			// 	capture((v) => updateTabContent(TabId.hast, toJSON(v)))
			// ],
			// reorgPlugins: [capture((v) => updateTabContent(TabId.oast, toJSON(v)))]
		})

		return (
			<div className="prose h-full overflow-auto">
				<Content />
			</div>
		)
	}
}
