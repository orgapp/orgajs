/**
 * @typedef Range
 * @property {number} from
 * @property {number} to
 */
import { syntaxTree } from '@codemirror/language'
import { Decoration, ViewPlugin } from '@codemirror/view'

/**
 * @param {Range} a
 * @param {Range} b
 */
function overlap(a, b) {
  return a.from <= b.to && a.to >= b.from
}

// TODO: this plugin is getting big, in terms of responsibility, break it down
export const cleanupPlugin = ViewPlugin.define(
  (view) => {
    let _data = createDecorations(view)
    let _selection = view.state.selection.main

    return {
      get decorations() {
        return _data.decorations
      },
      get selection() {
        return _selection
      },
      update(update) {
        _selection = update.state.selection.main
        if (update.docChanged) {
          _data = createDecorations(update.view)
        }
      },
    }
  },
  {
    decorations: (v) => {
      const { decorations, selection } = v
      return decorations.update({
        filter: (_from, _to, deco) => {
          const revealRange = deco.spec.revealRange
          if (revealRange) {
            return !overlap(revealRange, selection)
          }
          return true
        },
      })
    },
    eventHandlers: {
      // cmd+click to open links
      mousedown(e, view) {
        const pos = view.posAtCoords(e)
        if (!pos) return
        if (!e.metaKey) return
        this.decorations.between(pos, pos, (_from, _to, deco) => {
          const { tagName, attributes } = deco.spec
          if (tagName === 'a' && attributes) {
            e.preventDefault()
            // TODO: is it possible to make it a real link?
            // I guess that'd be difficult because it's a fucking editor
            window.open(deco.spec.attributes.href, '_blank')
            return false
          }
        })
      },
    },
  },
)

/**
 * @param {Range | null} reveal
 */
function hide(reveal) {
  return Decoration.replace({
    revealRange: reveal,
  })
}

/**
 * @param {boolean} actionable
 */
function todo(actionable) {
  return Decoration.mark({
    attributes: { class: actionable ? 'cm-todo' : 'cm-done' },
  })
}

/**
 * @param {import('@codemirror/view').EditorView} view
 * @param {import('@codemirror/view').DecorationSet} [decorations]
 */
function createDecorations(view, decorations = Decoration.none) {
  /** @type {Range[]} */
  const links = []

  /** @type {Range | null} */
  let headlineRange = null
  /** @type {Range | null} */
  let linkRange = null
  syntaxTree(view.state).iterate({
    enter(node) {
      if (node.name.startsWith('headline'))
        headlineRange = { from: node.from, to: node.to }

      if (node.name === 'link') {
        linkRange = { from: node.from, to: node.to }
      }

      if (node.name === 'url') {
        if (linkRange === null) return
        // get text of node
        const text = view.state.doc.sliceString(node.from, node.to)
        decorations = decorations.update({
          add: [
            Decoration.mark({
              tagName: 'a',
              attributes: { class: 'cm-link', href: text.slice(1, -1) },
            }).range(linkRange.from, linkRange.to),
          ],
        })
      }

      if (node.name === 'url' || node.name === 'mark') {
        decorations = decorations.update({
          add: [hide(linkRange).range(node.from, node.to)],
        })
      }

      if (node.name === 'stars') {
        const revealRange = { from: headlineRange?.from, to: headlineRange?.to }
        decorations = decorations.update({
          add: [
            Decoration.replace({
              revealRange,
            }).range(node.from, node.to),
          ],
        })
      }

      if (node.name === 'todo') {
        decorations = decorations.update({
          add: [todo(true).range(node.from, node.to)],
        })
      }

      if (node.name === 'done') {
        decorations = decorations.update({
          add: [todo(false).range(node.from, node.to)],
        })
      }
    },
    leave: (node) => {
      if (node.name.startsWith('headline')) headlineRange = null
      if (node.name === 'link') linkRange = null
    },
  })
  return { decorations, links }
}
