import { evaluate } from '@orgajs/orgx'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import {
	defaultHighlightStyle,
	syntaxHighlighting,
	foldGutter,
} from '@codemirror/language'
import * as runtime from 'react/jsx-runtime'
import { VFile } from 'vfile'
import { makeEditor } from '@orgajs/editor'
import { h } from './h.ts'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { javascript } from '@codemirror/lang-javascript'
import { map } from 'unist-util-map'

class OrgaEditor extends HTMLElement {
	constructor() {
		super()
	}

	connectedCallback() {
		const content = this.textContent
		this.innerHTML = `
<div class="h-64 not-prose">
  <div id="editor"></div>
</div>`
		const dom = this.querySelector('#editor')
		makeEditor({
			target: dom,
			content,
		})
	}
}

customElements.define('orga-editor', OrgaEditor)

enum TabId {
	rendered,
	oast,
	hast,
	jsx,
}

type Tab = {
	id: TabId
	name: string
	content: string
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
			{ id: TabId.jsx, name: 'jsx code', content: '' },
		]

		function updateTabContent(tab: TabId, content: string) {
			tabs.find((t) => t.id === tab).content = content
		}

		const content = this.getAttribute('content')

		// -- UI --
		const editorMount = h('div')
		const left = h(
			'div.h-full.w-1/2.border-r.border-slate-400',
			this.buildToolbar([
				{ name: 'Generate Link', onclick: () => console.log('generate link') },
			]),
			editorMount
		)
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
					EditorView.editable.of(false),
				],
			}),
		})

		const renderRoot = createRoot(rendered)

		const right = h(
			`div.flex.flex-col.h-full.w-1/2.${PREVIEW_PANEL_COLOR}`,
			// tabs
			h(
				'div.flex.bg-slate-300',
				this.buildTabs(tabs, select),
				h('div.flex-grow.border-b.border-slate-400')
			),
			// content
			h(
				'div.relative.h-full.overflow-auto',
				rendered,
				code,
				h('button.btn.absolute.right-2.top-2', 'Generate Link')
			)
		)

		function select(tab: Tab) {
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
					insert: tab.content,
				},
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
					capture((v) => updateTabContent(TabId.hast, toJSON(v))),
				],
				reorgPlugins: [capture((v) => updateTabContent(TabId.oast, toJSON(v)))],
			})

			renderRoot.render(createElement(Content))
			updateTabContent(TabId.jsx, String(file))
			const code = String(file)
			codeView.dispatch({
				changes: {
					from: 0,
					to: codeView.state.doc.length,
					insert: code,
				},
			})
		}

		makeEditor({
			target: editorMount,
			content,
			onChange: async (state) => {
				const newConent = state.doc.toString()
				render(newConent)
			},
		})

		this.appendChild(h('div.flex.h-full', left, right))

		render(content)
	}

	buildToolbar(buttons) {
		return h(
			'div.flex.p-1.bg-slate-200.border-2.border-b-slate-400.border-r-slate-400.border-l-white.border-t-white',
			...buttons.map(({ name, onclick }) => h('button.btn', name))
		)
	}

	buildTabs(tabs: Tab[], onSelect: (tab: Tab) => void) {
		const container = h(
			'div',
			...tabs.map((tab) =>
				// TODO: fix this 👇
				h(
					`button.#${tab.id}.px-2.cursor-pointer.border.border-slate-400.border-l-transparent`,
					{
						onclick: () => select(tab),
					},
					`${tab.name}`
				)
			)
		)

		function select(tab: Tab) {
			container.querySelectorAll('button').forEach((b) => {
				if (b.id === `${tab.id}`) {
					b.classList.add(PREVIEW_PANEL_COLOR)
					b.classList.add('border-b-transparent')
				} else {
					b.classList.remove(PREVIEW_PANEL_COLOR)
					b.classList.remove('border-b-transparent')
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
			return rest
		}),
		null,
		4
	)
}

customElements.define('orga-playground', OrgaPlayground)
