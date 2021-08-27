import { graphql } from 'gatsby'
import { OrgaRenderer } from 'gatsby-plugin-orga'
import React from 'react'
import Layout from '../components/layout'

const Document = (props) => {
  const { data } = props

  // const Layout = import(data.document.layout)
  return (
    <>
      {data.document && data.document.body && (
        <>
          <h2>Rendered</h2>
          <OrgaRenderer scope={{ Layout }}>{data.document.body}</OrgaRenderer>
          <h2>Code</h2>
          <pre>{data.document.body}</pre>
        </>
      )}
      <h2>Props</h2>
      <pre>{JSON.stringify(props, null, 2)}</pre>
    </>
  )
}

export default Document

// export const pageQuery = graphql`
//   query DocumentQuery($id: String!) {
//     document: docs(id: { eq: $id }) {
//       id
//       body
//       layout
//     }
//   }
// `
