import { makeEditor } from '@orgajs/editor'

class OrgaEditor extends HTMLElement {
	constructor() {
		super()
		// this.attachShadow({ mode: 'open' })
		// this.shadowRoot.innerHTML = `<div class="border" id="editor"></div>`
	}

	connectedCallback() {
		const content = this.textContent
		this.innerHTML = `
<div class="border border-pink-200 h-64 not-prose">
  <div id="editor"></div>
</div>`
		const dom = this.querySelector('#editor')
		console.log(dom, content)
		makeEditor({
			target: dom,
			content,
			// onChange: (state) => {
			// 	this.textContent = state.doc.toString()
			// }
		})
	}
}

customElements.define('orga-editor', OrgaEditor)
