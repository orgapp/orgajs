const path = require(`path`)
const slash = require(`slash`)

exports.createPages = ({ graphql, boundActionCreators }) => {
  const { createPage } = boundActionCreators

  return new Promise((resolve, reject) => {
    const blogPostTemplate = path.resolve(`src/templates/post.js`)
    graphql(
      `
        {
          allOrga(
            limit: 1000
          ) {
            edges {
              node {
                fields {
                  slug
                }
              }
            }
          }
        }
      `
    ).then(result => {
      if (result.errors) {
        console.log(result.errors)
      }

      // Create blog posts pages.
      result.data.allOrga.edges.forEach(edge => {
        createPage({
          path: edge.node.fields.slug, // required
          component: slash(blogPostTemplate),
          context: {
            slug: edge.node.fields.slug,
          },
        })
      })

      resolve()
    })
  })
}

// Add custom url pathname for blog posts.
exports.onCreateNode = ({ node, boundActionCreators, getNode }) => {
  const { createNodeField } = boundActionCreators

  if (node.internal.type === `File`) {
    const parsedFilePath = path.parse(node.absolutePath)
    // const slug = `/${parsedFilePath.dir.split(`---`)[1]}/`
    const slug = `/${parsedFilePath.name}/`
    createNodeField({ node, name: `slug`, value: slug })
  } else if (
    node.internal.type === `Orga` &&
      typeof node.slug === `undefined`
  ) {
    const fileNode = getNode(node.parent)
    createNodeField({
      node,
      name: `slug`,
      value: fileNode.fields.slug,
    })

  }
}
