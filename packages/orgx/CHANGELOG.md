# @orgajs/orgx

## 2.2.2

### Patch Changes

- @orgajs/reorg-rehype@4.1.3

## 2.2.1

### Patch Changes

- @orgajs/reorg-parse@4.1.2
- @orgajs/reorg-rehype@4.1.2

## 2.2.0

### Minor Changes

- ac322714: implement editor

### Patch Changes

- @orgajs/reorg-parse@4.1.1
- @orgajs/reorg-rehype@4.1.1

## 2.1.0

### Minor Changes

- 4d8efbb7: Add increamental parsing ability for the editor.

### Patch Changes

- Updated dependencies [4d8efbb7]
  - @orgajs/reorg-rehype@4.1.0
  - @orgajs/reorg-parse@4.1.0

## 2.0.1

### Patch Changes

- 1dbf674d: fix layout issue

  `OrgaLayout` was renamed to `OrgLayout`.

## 2.0.0

### Major Changes

- 176a3b5d: # Migrate most of the ecosystem to ESM

  We are excited to announce that we have migrated most of our ecosystem to ESM! This move was necessary as the unified ecosystem had already transitioned to ESM, leaving our orgajs system stuck on an older version if we wanted to stay on commonjs. We understand that this transition may come with some inevitable breaking changes, but we have done our best to make it as gentle as possible.

  In the past, ESM support in popular frameworks like webpack, gatsby, and nextjs was problematic, but the JS world has steadily moved forward, and we are now in a much better state. We have put in a lot of effort to bring this project up to speed, and we are happy to say that it's in a pretty good state now.

  We acknowledge that there are still some missing features that we will gradually add back over time. However, we feel that the changes are now in a great state to be released to the world. If you want to use the new versions, we recommend checking out the `examples` folder to get started.

  We understand that this upgrade path may not be compatible with older versions, and we apologize for any inconvenience this may cause. However, we encourage you to consider starting fresh, as the most important part of your site should always be your content (org-mode files). Thank you for your understanding, and we hope you enjoy the new and improved ecosystem!

### Patch Changes

- Updated dependencies [176a3b5d]
  - @orgajs/reorg-rehype@4.0.0
  - @orgajs/reorg-parse@4.0.0

## 1.0.8

### Patch Changes

- eeccc870: - get image links out of paragraph
  - some other minor fixes
- Updated dependencies [eeccc870]
  - @orgajs/reorg-rehype@3.0.10
  - @orgajs/reorg-parse@3.1.7

## 1.0.7

### Patch Changes

- 6c1ddb9f: add latex support
  - @orgajs/reorg-rehype@3.0.9
  - @orgajs/reorg-parse@3.1.6

## 1.0.6

### Patch Changes

- 4bde5155: tidy up dependencies
  - @orgajs/reorg-parse@3.1.5
  - @orgajs/reorg-rehype@3.0.8

## 1.0.5

### Patch Changes

- @orgajs/reorg-rehype@3.0.7
- @orgajs/reorg-parse@3.1.4

## 1.0.4

### Patch Changes

- @orgajs/reorg-parse@3.1.3
- @orgajs/reorg-rehype@3.0.6

## 1.0.3

### Patch Changes

- cd7cac3d: export evaluateSync

## 1.0.2

### Patch Changes

- c8edd571: add evaluateSync function to orgx

## 1.0.1

### Patch Changes

- 594bf16b: ## @orgajs/orgx

  Introducing new compiler `@orgajs/orgx`. It's a (almost) a direct port of [xdm](https://github.com/wooorm/xdm).

  Most of the packages have already adopted `@orgajs/orgx`. The important ones are:

  - `@orgajs/loader`
  - `@orgajs/next`
  - `gatsby-plugin-orga`
  - `gatsby-theme-orga-docs`
  - `@orgajs/playground'`

  `gatsby-transformer-orga` is still using the original compiler, since it has it's own ecosystem which requires some work to do a proper migration. That means the derivative packages around it are using the original compiler.

  - `gatsby-theme-orga-posts`
  - `gatsby-theme-orga-posts-core`

  ## theme-ui support

  `theme-ui` has `mdx` support builtin, and it's hard to do a clean extraction. So the package `@orgajs/theme-ui` is wrapping theme-ui, and provide orga specific tweaks. For gatsby, `gatsby-plugin-orga-theme-ui` is the equivalent of `gatsby-plugin-theme-ui`, but with orga support.

  - @orgajs/reorg-parse@3.1.2
  - @orgajs/reorg-rehype@3.0.5
