exports.createSchemaCustomization = ({ actions, schema }, themeOptions) => {
  const { createTypes } = actions
  createTypes`
    type InfoToml implements Node {
      twitter: String
      github: String
      email: String
    }
  `
}
