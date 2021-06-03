import React from 'react'
import { graphql } from 'gatsby'
import { OrgaRenderer } from 'gatsby-plugin-orga'

export default (props) => {
  const { data } = props
  return (
    <>
      { data.document && data.document.body &&
        <>
          {/* <h2>Rendered</h2>
              <OrgaRenderer>
              { data.document.body }
              </OrgaRenderer> */}
          <h2>Code</h2>
          <pre>
            {data.document.body}
          </pre>
        </>
      }
      <h2>Props</h2>
      <pre>
        { JSON.stringify(props, null, 2) }
      </pre>
    </>
  )
}

export const pageQuery = graphql`
  query DocumentQuery($id: String!) {
    document: orgx(id: { eq: $id }) {
      id
      body
    }
  }
`
