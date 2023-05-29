---
'gatsby-plugin-orga': major
'@orgajs/rehype-estree': major
'oast-to-hast': major
'@orgajs/reorg-rehype': major
'@orgajs/reorg-parse': major
'@orgajs/estree-jsx': major
'@orgajs/metadata': major
'text-kit': major
'@orgajs/loader': major
'@orgajs/rollup': major
'@orgajs/astro': major
'@orgajs/react': major
'@orgajs/reorg': major
'@orgajs/next': major
'orga': major
'@orgajs/orgx': major
'@orgajs/getting-started': major
'@orgajs/example-next': major
'@orgajs/example-next-app-dir': major
---

# Migrate most of the ecosystem to ESM

We are excited to announce that we have migrated most of our ecosystem to ESM! This move was necessary as the unified ecosystem had already transitioned to ESM, leaving our orgajs system stuck on an older version if we wanted to stay on commonjs. We understand that this transition may come with some inevitable breaking changes, but we have done our best to make it as gentle as possible.

In the past, ESM support in popular frameworks like webpack, gatsby, and nextjs was problematic, but the JS world has steadily moved forward, and we are now in a much better state. We have put in a lot of effort to bring this project up to speed, and we are happy to say that it's in a pretty good state now.

We acknowledge that there are still some missing features that we will gradually add back over time. However, we feel that the changes are now in a great state to be released to the world. If you want to use the new versions, we recommend checking out the `examples` folder to get started.

We understand that this upgrade path may not be compatible with older versions, and we apologize for any inconvenience this may cause. However, we encourage you to consider starting fresh, as the most important part of your site should always be your content (org-mode files). Thank you for your understanding, and we hope you enjoy the new and improved ecosystem!
