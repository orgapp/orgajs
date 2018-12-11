const path = require('path')
const { createFilePath } = require('gatsby-source-filesystem')
const util = require('util')

const queryAllOrga = `
{
  allOrgContent {
    edges {
      node {
        title
        category
        date
        exportFileName
        orga_id
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
          const { category, exportFileName, orga_id } = post.node
          const slug = path.resolve(
            '/',
            category || '',
            exportFileName || '')
          createPage({
            path: slug,
            component: template,
            context: {
              orga_id,
            },
          })
        })
      })
    )
  })
}

// exports.onCreateNode = ({ node, actions, getNode }) => {
//   const { createNodeField } = actions

//   if (node.internal.type === `OrgContent`) {
//     // console.log(`++ onCreateNode ++`)
//     console.log(`++`, util.inspect(node, false, null, true))

//     const value = `/${node.category}/${node.exportFileName}/`
//     createNodeField({
//       name: `slug`,
//       node,
//       value,
//     })
//   }
// }
