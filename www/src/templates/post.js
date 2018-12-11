import React from 'react'

export default (props) => {
    const content = props.data.orgContent
    return (
	<h2>{ content.title }</h2>
    )
}

export const pageQuery = graphql`
  query OrgaNodeById($orga_id: String!) {
    orgContent(orga_id: { eq: $orga_id }) {
      id
      title
    }
  }
`
