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
