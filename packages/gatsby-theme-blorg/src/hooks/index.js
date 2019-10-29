import { useStaticQuery, graphql } from "gatsby"
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
            github
            email
          }
        }
      }
    `
  )
  return site.siteMetadata
}
