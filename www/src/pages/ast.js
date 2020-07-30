import React from 'react'
import { parse } from 'orga'
import Layout from '../components/layout'
import { graphql } from 'gatsby'

export default class AST extends React.Component {
  render() {
    const d = this.props.data.astToml
    const replacer = (key, value) => {
      if ([`parent`].includes(key)) return
      if (Array.isArray(value) && value.length === 0) return
      return value
    }
    const examples = d.examples.map((e, i) => {
      const obj = parse(e.org)
      const json = JSON.stringify(obj.children[0], replacer, 2)
      return (
        <div key={`ast-item-${i}`}>
          <h2>{ e.name }</h2>
          <p>{ e.desc }</p>
          <pre><code>{ e.org }</code></pre>
          <p>Yields:</p>
          <pre><code>{ json }</code></pre>
        </div>
      )
    })
    return (
      <Layout>
        <h1>Abstract Syntax Tree</h1>
        { examples }
      </Layout>
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
