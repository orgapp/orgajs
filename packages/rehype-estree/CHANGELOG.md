# Change Log

## 4.0.0

### Major Changes

- 176a3b5d: # Migrate most of the ecosystem to ESM

  We are excited to announce that we have migrated most of our ecosystem to ESM! This move was necessary as the unified ecosystem had already transitioned to ESM, leaving our orgajs system stuck on an older version if we wanted to stay on commonjs. We understand that this transition may come with some inevitable breaking changes, but we have done our best to make it as gentle as possible.

  In the past, ESM support in popular frameworks like webpack, gatsby, and nextjs was problematic, but the JS world has steadily moved forward, and we are now in a much better state. We have put in a lot of effort to bring this project up to speed, and we are happy to say that it's in a pretty good state now.

  We acknowledge that there are still some missing features that we will gradually add back over time. However, we feel that the changes are now in a great state to be released to the world. If you want to use the new versions, we recommend checking out the `examples` folder to get started.

  We understand that this upgrade path may not be compatible with older versions, and we apologize for any inconvenience this may cause. However, we encourage you to consider starting fresh, as the most important part of your site should always be your content (org-mode files). Thank you for your understanding, and we hope you enjoy the new and improved ecosystem!

## 3.0.6

### Patch Changes

- eeccc870: - get image links out of paragraph
  - some other minor fixes

## 3.0.5

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

## 3.0.4

### Patch Changes

- 19156b8a: inject props into layout

## 3.0.3

### Patch Changes

- 8c6f440b: - better layout support
  - rename MDXxxx to Orgaxxx
- 4baa1f93: remove ast-types
- e8d61a98: render error messages when failed to parse jsx code

## 3.0.2

### Patch Changes

- 7f209ff5: export Options type

## 3.0.1

### Patch Changes

- 6ed76057: # rename gatsby themes

  - gatsby-theme-orga -> gatsby-theme-orga-posts-core
  - gatsby-theme-blorg -> gatsby-theme-orga-posts

  # add example projects

  - gatsby-posts
  - gatsby-posts-core

- 759e6149: # Bug Fixes

  - fix lexer for parsing headline with todo keyword
  - fix properties drawer issue
  - fix orga-theme-ui-preset package
  - fix gatsby-transformer-orga & gatsby-theme-blorg

  # Improved Playground

  - add `tokens` view
  - show node type in tree views

## 3.0.0

### Major Changes

- 8b02d10: # Features

  - more powerful and flexible lexer and parser
  - webpack support
  - `jsx` support
  - better code block rendering
  - better image processing in gatsby
  - updated examples
  - tons of bug fixes
  - brand new `gatsby-plugin-orga`

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.6.0](https://github.com/orgapp/orgajs/tree/master/packages/rehype-estree/compare/v2.5.0...v2.6.0) (2021-08-28)

### Bug Fixes

- fix examples ([bdcd265](https://github.com/orgapp/orgajs/tree/master/packages/rehype-estree/commit/bdcd2655502a73800e8915ba09fd78452dff503f))
- remove prepublish step individually ([a75a6a9](https://github.com/orgapp/orgajs/tree/master/packages/rehype-estree/commit/a75a6a9606421b66b6ef69b28e3fcb03a5ee282a))
- **website:** better code block ([9d5b3a2](https://github.com/orgapp/orgajs/tree/master/packages/rehype-estree/commit/9d5b3a2d554672d22523727e89b2b5c60dc6233d))

### Features

- add jsx support ([0d22499](https://github.com/orgapp/orgajs/tree/master/packages/rehype-estree/commit/0d224990b412e064ebf6816608eea6766f93d60c))

# [2.5.0](https://github.com/orgapp/orgajs/tree/master/packages/rehype-estree/compare/v2.4.9...v2.5.0) (2021-08-27)

### Bug Fixes

- fix examples ([bdcd265](https://github.com/orgapp/orgajs/tree/master/packages/rehype-estree/commit/bdcd2655502a73800e8915ba09fd78452dff503f))

### Features

- add jsx support ([0d22499](https://github.com/orgapp/orgajs/tree/master/packages/rehype-estree/commit/0d224990b412e064ebf6816608eea6766f93d60c))

## [2.4.9](https://github.com/orgapp/orgajs/tree/master/packages/rehype-estree/compare/v2.4.8...v2.4.9) (2021-07-13)

**Note:** Version bump only for package @orgajs/rehype-estree
