import { evaluate } from '@orgajs/orgx'
import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import {
	defaultHighlightStyle,
	syntaxHighlighting,
	indentOnInput,
	bracketMatching,
	foldGutter,
	foldKeymap,
} from '@codemirror/language'
import * as runtime from 'react/jsx-runtime'
import { VFile } from 'vfile'
import { makeEditor } from '@orgajs/editor'
import { h } from './h.ts'
import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import { javascript } from '@codemirror/lang-javascript'

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

type Tab = 'rendered' | 'code' | 'tokens' | 'syntax tree'

class OrgaPlayground extends HTMLElement {
	constructor() {
		super()
	}

	connectedCallback() {
		const content = this.getAttribute('content')

		const editor = h('div.h-full.w-1/2.border-r.border-slate-300')

		const rendered = h('div.hidden.p-4.prose')
		const code = h('div.hidden.h-full')

		const codeView = new EditorView({
			parent: code,
			state: EditorState.create({
				doc: 'console.log("Hello, World!")',
				extensions: [
					syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
					javascript(),
					EditorView.editable.of(false),
				],
			}),
		})

		const renderRoot = createRoot(rendered)

		const preview = h(
			'div.h-full.w-1/2',
			this.buildTabs(['rendered', 'code', 'tokens', 'syntax tree'], select),
			h('div', rendered, code)
		)

		function select(tab: string) {
			if (tab === 'rendered') {
				rendered.classList.remove('hidden')
				code.classList.add('hidden')
			} else {
				rendered.classList.add('hidden')
				code.classList.remove('hidden')
			}
		}

		async function render(content: string) {
			function capture(fn: (v: any) => void) {
				return function () {
					return function (tree) {
						fn(tree)
					}
				}
			}

			let oast = null
			const hast = null
			const file = new VFile(content)

			const { default: Content } = await evaluate(file, {
				...runtime,
				reorgPlugins: [capture((v) => (oast = v))],
			})

			renderRoot.render(createElement(Content))
			const code = String(file)
			console.log({ code })
			codeView.dispatch({
				changes: {
					from: 0,
					to: codeView.state.doc.length,
					insert: code,
				},
			})
			// panels.code.textContent = code
			// panels['syntax tree'].textContent = JSON.stringify(oast, null, 2)
		}

		makeEditor({
			target: editor,
			content,
			onChange: async (state) => {
				const newConent = state.doc.toString()
				render(newConent)
			},
		})

		const wrapper = h('div.flex.h-full', editor, preview)
		this.appendChild(wrapper)
	}

	buildTabs(tabs: string[], onSelect: (tab: string) => void) {
		const container = h(
			'div.bg-slate-300',
			...tabs.map((tab) =>
				h(
					`button.px-2.cursor-pointer`,
					{
						onclick: () => select(tab),
					},
					tab
				)
			)
		)

		function select(tab: string) {
			container.querySelectorAll('button').forEach((b) => {
				if (b.textContent === tab) {
					b.classList.add('bg-white')
				} else {
					b.classList.remove('bg-white')
				}
			})
			onSelect(tab)
		}

		select(tabs[0])

		return container
	}
}

customElements.define('orga-playground', OrgaPlayground)
