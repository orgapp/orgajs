// TODO: find a way to test this
import { onCreateNode } from '../gatsby-node'

describe.skip('gatsby transformer', () => {
  it('Works', async () => {
    const node: any = {
      id: `whatever`,
      children: [],
      internal: {
        contentDigest: `whatever`,
        mediaType: `text/x-org`,
      },
    }
    const content = `#+TITLE: hello world
* headline one
* TODO headline two
normal content here

#+BEGIN_SRC javascript
console.log("hello world")
#+END_SRC
`
    // Make some fake functions its expecting.
    const loadNodeContent = (node) => Promise.resolve(node.content)

    node.content = content
    const createNode = jest.fn()
    const createParentChildLink = jest.fn()
    const boundActionCreators = { createNode, createParentChildLink }

    await onCreateNode({
      node,
      loadNodeContent,
      boundActionCreators,
    }).then(() => {
      expect(createNode.mock.calls).toMatchSnapshot()
      expect(createNode).toHaveBeenCalledTimes(1)
      expect(createParentChildLink).toHaveBeenCalledTimes(1)
    })
  })
})
