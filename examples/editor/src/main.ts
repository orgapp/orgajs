import { makeEditor } from '@orgajs/editor'
import content from '../../../README.org?raw'

const place = document.querySelector('#editor')
if (place !== null) {
  makeEditor(place, content)
}
