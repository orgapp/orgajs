const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')
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

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `OrgContent`) {
    // console.log(`++ onCreateNode ++`)
    // console.log(`++`, util.inspect(node, false, null, true))

    const { category, export_file_name } = node.meta
    const slug = path.resolve(
      '/',
      category || '',
      export_file_name || '')
    // const value = `/${node.category}/${node.exportFileName}/`
    createNodeField({
      name: `slug`,
      node,
      value: slug,
    })
  }
}
