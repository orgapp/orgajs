import { makeEditor } from '@orgajs/editor'

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
