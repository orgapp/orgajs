import React from 'react'
import { graphql } from 'gatsby'
import { OrgaRenderer } from 'gatsby-plugin-orga'

export default (props) => {
  const { data } = props
  return (
    <div>
      { data.document && data.document.html &&
        <>
          <h2>HTML</h2>
          {/* <OrgaRenderer>
              { data.document.html }
              </OrgaRenderer> */}
          <pre>
            {data.document.html}
          </pre>
        </>
      }
      <h2>Props</h2>
      <pre>
        { JSON.stringify(props, null, 2) }
      </pre>
    </div>
  )
}

export const pageQuery = graphql`
  query DocumentQuery($id: String!) {
    document: orgx(id: { eq: $id }) {
      id
      html
    }
  }
`
