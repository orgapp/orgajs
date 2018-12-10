const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')

const queryAllOrga = `
{
  allOrga {
    edges {
      node {
        id
        content {
          title
          category
          date
          exportFileName
          html
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

        const files = result.data.allOrga.edges
        files.forEach(file => {
          file.node.content.forEach(post => {
            createPage({
              path: `${post.category || 'p'}/${post.exportFileName}`,
              component: template,
              context: {
                nodeId: `${file.node.id}`,
                exportFileName: post.exportFileName,
              },
            })
          })
        })
      })
    )
  })
}

exports.onCreateNode = ({ node, actions, getNode }) => {
  const { createNodeField } = actions

  if (node.internal.type === `Orga`) {
    const value = createFilePath({ node, getNode })
    createNodeField({
      name: `slug`,
      node,
      value,
    })
  }
}
