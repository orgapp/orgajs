/** @jsx jsx */
import { graphql, useStaticQuery } from 'gatsby'
import { GatsbyImage, getImage } from 'gatsby-plugin-image'
import { jsx } from 'theme-ui'

export default ({ width = [80, 120] }) => {
  const { avatar } = useStaticQuery(graphql`
    query BioQuery {
      avatar: file(absolutePath: { regex: "/avatar.(jpeg|jpg|gif|png)/" }) {
        childImageSharp {
          gatsbyImageData(width: 120, height: 120, layout: CONSTRAINED)
        }
      }
    }
  `)

  return (
    <GatsbyImage
      image={getImage(avatar)}
      alt={''}
      sx={{
        width,
        borderRadius: '50%',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: 'text',
        boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
        transition: '0.3s',
        '&:hover': {
          transform: 'scale(1.1)',
        },
      }}
    />
  )
}
