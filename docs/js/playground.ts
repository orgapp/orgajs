import { evaluate } from '@orgajs/orgx'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import {
	defaultHighlightStyle,
	syntaxHighlighting,
	foldGutter
} from '@codemirror/language'
import * as runtime from 'react/jsx-runtime'
import { VFile } from 'vfile'
import { makeEditor } from '@orgajs/editor'
import { h } from './h.ts'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { javascript } from '@codemirror/lang-javascript'
import { map } from 'unist-util-map'

enum TabId {
	rendered,
	oast,
	hast,
	jsx
}

type Tab = {
	id: TabId
	name: string
	content: string
}

type Button = {
	name: string
	onclick: () => void
}

const PREVIEW_PANEL_COLOR = 'bg-stone-100'

class OrgaPlayground extends HTMLElement {
	constructor() {
		super()
	}

	connectedCallback() {
		const tabs = [
			{ id: TabId.rendered, name: 'rendered', content: '' },
			{ id: TabId.oast, name: 'oast (org-mode)', content: '' },
			{ id: TabId.hast, name: 'hast (html)', content: '' },
			{ id: TabId.jsx, name: 'jsx code', content: '' }
		]

		function updateTabContent(tab: TabId, content: string) {
			tabs.find((t) => t.id === tab).content = content
		}

		function getTabContent(tab: TabId) {
			return tabs.find((t) => t.id === tab).content
		}

		let content = this.getAttribute('content')
		const url = new URL(window.location.href)
		const text = url.searchParams.get('text')
		let currentTab = TabId.rendered

		if (text) {
			content = decodeURIComponent(text)
		}

		// -- UI --
		const editorMount = h('div.h-full')
		const left = h('div.h-full.w-1/2.border-r', editorMount)
		const rendered = h('div.hidden.p-4.prose')
		const code = h('div.hidden')

		const codeView = new EditorView({
			parent: code,
			state: EditorState.create({
				doc: 'console.log("Hello, World!")',
				extensions: [
					foldGutter(),
					syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
					javascript(),
					EditorView.editable.of(false)
				]
			})
		})

		const renderRoot = createRoot(rendered)

		const toolbar = h(
			'div',
			this.buildToolbar([
				{
					name: 'Generate Link',
					onclick: () => {
						const text = content
						const url = new URL(window.location.href)
						const encoded = encodeURIComponent(text)
						url.searchParams.set('text', encoded)
						navigator.clipboard.writeText(url.toString())
						window.echo('Link copied to clipboard')
					}
				}
			])
		)

		const right = h(
			`div.flex.flex-col.h-full.w-1/2.${PREVIEW_PANEL_COLOR}`,
			// tabs
			h(
				'div.flex.bg-slate-300',
				this.buildTabs(tabs, select),
				h('div.flex-grow.border-b')
			),
			// content
			h('div.bg-base-100.relative.h-full.overflow-auto', rendered, code),
			h(
				'div.flex.items-center.bg-base-300.border-t.py-1.px-2',
				h(
					'button.btn',
					{
						onclick: () => {
							const text = content
							const url = new URL(window.location.href)
							const encoded = encodeURIComponent(text)
							url.searchParams.set('text', encoded)
							navigator.clipboard.writeText(url.toString())
							window.echo('Link copied to clipboard')
						}
					},
					'generate link'
				)
			)
		)

		function select(tab: Tab) {
			currentTab = tab.id
			if (tab.id === TabId.rendered) {
				rendered.classList.remove('hidden')
				code.classList.add('hidden')
			} else {
				rendered.classList.add('hidden')
				code.classList.remove('hidden')
			}

			codeView.dispatch({
				changes: {
					from: 0,
					to: codeView.state.doc.length,
					insert: tab.content
				}
			})
		}

		async function render(content: string) {
			function capture(fn: (v: any) => void) {
				return function () {
					return function (tree) {
						fn(tree)
					}
				}
			}

			const file = new VFile(content)

			const { default: Content } = await evaluate(file, {
				...runtime,
				rehypePlugins: [
					capture((v) => updateTabContent(TabId.hast, toJSON(v)))
				],
				reorgPlugins: [capture((v) => updateTabContent(TabId.oast, toJSON(v)))]
			})

			renderRoot.render(createElement(Content))
			updateTabContent(TabId.jsx, String(file))
			const code = getTabContent(currentTab)
			codeView.dispatch({
				changes: {
					from: 0,
					to: codeView.state.doc.length,
					insert: code
				}
			})
		}

		makeEditor({
			target: editorMount,
			content,
			onChange: async (state) => {
				content = state.doc.toString()
				render(content)
			}
		})

		this.appendChild(h('div.flex.h-full', left, right))

		render(content)
	}

	buildToolbar(buttons: Button[]) {
		return h(
			'div.toolbar',
			...buttons.map(({ name, onclick }) => h('button', { onclick }, name))
		)
	}

	buildTabs(tabs: Tab[], onSelect: (tab: Tab) => void) {
		const container = h(
			'menu.mt-1.z-20',
			...tabs.map((tab) =>
				// TODO: fix this 👇
				h(
					`button.tab.#${tab.id}`,
					{
						onclick: () => select(tab)
					},
					`${tab.name}`
				)
			)
		)

		function select(tab: Tab) {
			container.querySelectorAll('button').forEach((b) => {
				if (b.id === `${tab.id}`) {
					b.setAttribute('aria-selected', 'true')
				} else {
					b.setAttribute('aria-selected', 'false')
				}
			})
			onSelect(tab)
		}

		select(tabs[0])

		return container
	}
}

function toJSON(tree: any) {
	return JSON.stringify(
		map(tree, (node) => {
			const { position, ...rest } = node
			return node
		}),
		null,
		4
	)
}

customElements.define('orga-playground', OrgaPlayground)

function debounce(func, duration) {
	let timeout

	return function (...args) {
		const effect = () => {
			timeout = null
			return func.apply(this, args)
		}

		clearTimeout(timeout)
		timeout = setTimeout(effect, duration)
	}
}

// function message(msg: string) {
// 	const minibuffer = document.getElementById('minibuffer')
// 	minibuffer.textContent = msg
// }
