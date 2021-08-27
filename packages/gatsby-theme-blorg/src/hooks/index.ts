import { graphql, useStaticQuery } from 'gatsby'
export const useSiteMetadata = () => {
  const { site } = useStaticQuery(
    graphql`
      query SiteMetaData {
        site {
          siteMetadata {
            title
            author
            siteUrl
            description
            twitter
            social {
              name
              url
            }
          }
        }
      }
    `
  )
  return site.siteMetadata
}
