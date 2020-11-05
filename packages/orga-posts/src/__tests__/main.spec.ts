import { build, toHtml } from '../index'

describe('Smoke Test', () => {
  it('works', async () => {
    const content = `
#+ORGA_PUBLISH_KEYWORD: PUBLISHED
#+TODO: DRAFT | PUBLISHED
#+DATE: 2018-01-01

* PUBLISHED my first post
CLOSED: <2018-01-01 Mon>

[[https://github.com/xiaoxinghu/orgajs][Here's]] to the *crazy* ones, the /misfits/, the _rebels_, the ~troublemakers~,
the round pegs in the +round+ square holes...

Here is some footnote[fn:1].

* DONE level1 headline :tag1:tag2:
some content
** NEXT level 2 headline
some other content

[fn:1] This website is built with [[https://orga.js.org][orgajs]] and [[https://nextjs.org][next.js]].
`
    const posts = await build({ text: content, filename: 'smoke' })

    // console.log({ posts })

  })
})
