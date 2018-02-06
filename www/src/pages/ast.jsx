import React from 'react'
import { Parser } from 'orga'

export default class AST extends React.Component {
  render() {
    const d = this.props.data.astToml
    const parser = new Parser()
    const replacer = (key, value) => {
      if ([`parent`].includes(key)) return
      if (Array.isArray(value) && value.length === 0) return
      return value
    }
    const examples = d.examples.map(e => {
      const obj = parser.parse(e.org)
      const json = JSON.stringify(obj.children[0], replacer, 2)
      console.log(json)
      return (
        <div>
          <h2>{ e.name }</h2>
          <p>{ e.desc }</p>
          <pre><code>{ e.org }</code></pre>
          <p>Yields:</p>
          <pre><code>{ json }</code></pre>
        </div>
      )
    })
    return (
      <div>
        <h1>Abstract Syntax Tree</h1>
        { examples }
      </div>
    )
  }
}

export const pageQuery = graphql`
  query ast {
    astToml {
      examples {
        name
        org
        desc
      }
    }
  }
`
