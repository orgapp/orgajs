const path = require('path')
const util = require('util')

const queryAllOrga = `
{
  allOrgContent {
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

exports.createPages = ({ graphql, actions }) => {
  const { createPage } = actions

  return new Promise((resolve, reject) => {
    const template = path.resolve('./src/templates/post.js')
    resolve(
      graphql(queryAllOrga).then(result => {
        if (result.errors) {
          console.log(result.errors)
          reject(result.errors)
        }

        result.data.allOrgContent.edges.forEach(post => {
          createPage({
            path: post.node.fields.slug,
            component: template,
            context: {
              slug: post.node.fields.slug,
            },
          })
        })
      })
    )
  })
}

exports.onCreateNode = ({ node, actions }) => {
  if (node.internal.type !== `OrgContent`) return
  const { createNodeField } = actions
  const { category, export_file_name } = node.meta
  const paths = [
    `/`,
    category,
    export_file_name,
  ].filter(lpath => lpath)
  const slug = path.posix.join(...paths)
  createNodeField({
    node,
    name: `slug`,
    value: slug,
  })
}
