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
          // console.log({ reveal: deco.spec.revealRange })
          const revealRange = deco.spec.revealRange
          if (revealRange) {
            return !overlap(revealRange, selection)
          }
          return true
        },
      })
    },
    eventHandlers: {
      mousedown(e, view) {
        const pos = view.posAtCoords(e)
        if (!pos) return
        this.decorations.between(pos, pos, (_from, _to, deco) => {
          if ('tagName' in deco && deco.tagName === 'a' && 'attrs' in deco) {
            e.preventDefault()
            window.open(deco.attrs?.href, '_blank')
            return false
          }
          // console.log({ from, to, deco })
          // if (deco.spec.revealRange) {
          //   view.dispatch({
          //     selection: {
          //       anchor: deco.spec.revealRange.from,
          //       head: deco.spec.revealRange.to,
          //     },
          //   })
          // }
        })
        // this.posAtCoords({ x: e.clientX, y: e.clientY })
        // this.decorations.
      },
    },
  }
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
      if (node.name === 'link') linkRange = { from: node.from, to: node.to }

      if (node.name === 'link') {
        decorations = decorations.update({
          add: [
            // TODO: get the real url
            Decoration.mark({
              tagName: 'a',
              attributes: { class: 'cm-link', href: 'https://google.com' },
            }).range(node.from, node.to),
            // mark is not working
            // https://discuss.codemirror.net/t/decorated-a-tags-nor-treated-as-links-by-browser/3664
            // Decoration.widget({
            //   widget: new LinkWidget('https://google.com'),
            //   side: 1,
            // }).range(node.to),
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
            }).range(node.from, node.to + 1), // hide the space too
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
