/** @jsxImportSource theme-ui */
import { jsx } from 'theme-ui'
import { get } from 'lodash'
import SEO from 'gatsby-theme-orga-docs/src/components/seo'

export default ({ children, pageContext }) => {
  const title = get(pageContext, 'properties.title')
  return (
    <div>
      <SEO />
      <div
        sx={{
          maxWidth: 768,
          mx: 'auto',
          px: '1em',
        }}
      >
        <h1
          sx={{
            fontSize: 6,
            textAlign: 'center',
          }}
        >
          {title}
        </h1>
        {children}
      </div>
    </div>
  )
}
