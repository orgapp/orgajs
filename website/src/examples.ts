export default [
  {
    name: 'Hello World',
    code: `
* Hello World

Enter org-mode content here.

#+begin_src javascript
console.log('hello world')
#+end_src
`,
  },
  {
    name: 'Embed Raw HTML',
    code: `
* Embed Raw HTML

You can embed raw HTML.

#+begin_export html
<div style='backgroundColor:gold;padding:10px;'>this is a button</div>
#+end_export
`,
  },
  {
    name: 'Inline React Components',
    code: `
# you can define react components directly in org file
#+begin_export jsx
export const Box = ({children}) =>
  <div style={{
    backgroundColor: 'tomato',
    padding: 20,
    borderRadius: '0.5em',
    color: 'white',
  }}>{children}</div>
#+end_export

* Inline React Components

This is the react box.
# now we can use them later
#+jsx: <Box>the tomato box</Box>
`,
  },
  {
    name: 'With Layout',
    code: `
#+TITLE: a page with custom layout

# this is the inline layout of the page, notice that the metadata (title)
# is passed in to the layout component.
#+begin_export jsx
export default ({ title, children }) =>
  <div style={{
    borderStyle: 'solid',
    backgroundColor: 'gold',
    padding: 20,
    minHeight: '100%',
  }}>
    {title && <strong style={{
      color: 'blue',
      textTransform: 'uppercase'
    }}>{ title }</strong>}
    {children}
  </div>
#+end_export

* With Layout

Enter org-mode content here.

#+begin_src javascript
console.log('this is orga')
#+end_src
`,
  },
]
