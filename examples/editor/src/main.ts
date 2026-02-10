import { makeEditor } from '@orgajs/editor'
import content from '../content.org?raw'
import './style.css'

const target = document.querySelector('#editor')

if (target === null) {
	throw new Error('No target element found')
}
makeEditor({ target, content, extensions: [] })
