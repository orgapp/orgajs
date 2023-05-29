# Change Log

## 4.0.0

### Major Changes

- 176a3b5d: # Migrate most of the ecosystem to ESM

  We are excited to announce that we have migrated most of our ecosystem to ESM! This move was necessary as the unified ecosystem had already transitioned to ESM, leaving our orgajs system stuck on an older version if we wanted to stay on commonjs. We understand that this transition may come with some inevitable breaking changes, but we have done our best to make it as gentle as possible.

  In the past, ESM support in popular frameworks like webpack, gatsby, and nextjs was problematic, but the JS world has steadily moved forward, and we are now in a much better state. We have put in a lot of effort to bring this project up to speed, and we are happy to say that it's in a pretty good state now.

  We acknowledge that there are still some missing features that we will gradually add back over time. However, we feel that the changes are now in a great state to be released to the world. If you want to use the new versions, we recommend checking out the `examples` folder to get started.

  We understand that this upgrade path may not be compatible with older versions, and we apologize for any inconvenience this may cause. However, we encourage you to consider starting fresh, as the most important part of your site should always be your content (org-mode files). Thank you for your understanding, and we hope you enjoy the new and improved ecosystem!

### Patch Changes

- Updated dependencies [176a3b5d]
  - @orgajs/estree-jsx@4.0.0
  - @orgajs/metadata@2.0.0
  - @orgajs/loader@4.0.0
  - @orgajs/react@4.0.0
  - @orgajs/orgx@2.0.0

## 3.2.7

### Patch Changes

- eeccc870: - get image links out of paragraph
  - some other minor fixes
- Updated dependencies [eeccc870]
  - @orgajs/metadata@1.0.2
  - @orgajs/orgx@1.0.8
  - @orgajs/rehype-latex@1.0.2
  - @orgajs/loader@3.1.10

## 3.2.6

### Patch Changes

- 6c1ddb9f: add latex support
- Updated dependencies [6c1ddb9f]
  - @orgajs/orgx@1.0.7
  - @orgajs/rehype-latex@1.0.1
  - @orgajs/loader@3.1.9

## 3.2.5

### Patch Changes

- 4bde5155: tidy up dependencies
- Updated dependencies [4bde5155]
  - @orgajs/loader@3.1.8
  - @orgajs/orgx@1.0.6

## 3.2.4

### Patch Changes

- @orgajs/orgx@1.0.5
- @orgajs/loader@3.1.7

## 3.2.3

### Patch Changes

- @orgajs/orgx@1.0.4
- @orgajs/loader@3.1.6

## 3.2.2

### Patch Changes

- Updated dependencies [cd7cac3d]
  - @orgajs/orgx@1.0.3
  - @orgajs/loader@3.1.5

## 3.2.1

### Patch Changes

- Updated dependencies [c8edd571]
  - @orgajs/orgx@1.0.2
  - @orgajs/loader@3.1.4

## 3.2.0

### Minor Changes

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

### Patch Changes

- Updated dependencies [594bf16b]
  - @orgajs/loader@3.1.3
  - @orgajs/metadata@1.0.1
  - @orgajs/orgx@1.0.1

## 3.1.3

### Patch Changes

- 19156b8a: inject props into layout
- Updated dependencies [19156b8a]
  - @orgajs/rehype-estree@3.0.4
  - @orgajs/reorg-rehype@3.0.4
  - @orgajs/reorg@3.1.1
  - @orgajs/loader@3.1.2

## 3.1.2

### Patch Changes

- Updated dependencies [8c6f440b]
- Updated dependencies [4baa1f93]
- Updated dependencies [e8d61a98]
  - @orgajs/loader@3.1.1
  - @orgajs/react@3.0.1
  - @orgajs/rehype-estree@3.0.3

## 3.1.1

### Patch Changes

- Updated dependencies [7f209ff5]
  - @orgajs/estree-jsx@3.0.2
  - @orgajs/rehype-estree@3.0.2
  - @orgajs/reorg-rehype@3.0.3

## 3.1.0

### Minor Changes

- eeea0c54: introduce new token: empty line

### Patch Changes

- Updated dependencies [eeea0c54]
  - @orgajs/loader@3.1.0
  - @orgajs/reorg@3.1.0
  - @orgajs/reorg-rehype@3.0.2

## 3.0.3

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

- Updated dependencies [6ed76057]
- Updated dependencies [759e6149]
  - @orgajs/estree-jsx@3.0.1
  - @orgajs/loader@3.0.1
  - @orgajs/rehype-estree@3.0.1
  - @orgajs/reorg@3.0.1
  - @orgajs/reorg-rehype@3.0.1

## 3.0.2

### Patch Changes

- b3f5197: - add missing files
  - add missing dependencies

## 3.0.1

### Patch Changes

- d55bc8b: fix gatsby-plugin-orga by adding missing components folder

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

### Patch Changes

- Updated dependencies [8b02d10]
  - @orgajs/estree-jsx@3.0.0
  - @orgajs/loader@3.0.0
  - @orgajs/react@3.0.0
  - @orgajs/rehype-estree@3.0.0
  - @orgajs/reorg@3.0.0
  - @orgajs/reorg-rehype@3.0.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.6.0](https://github.com/orgapp/orgajs/compare/v2.5.0...v2.6.0) (2021-08-28)

### Bug Fixes

- fix examples ([bdcd265](https://github.com/orgapp/orgajs/commit/bdcd2655502a73800e8915ba09fd78452dff503f))
- remove prepublish step individually ([a75a6a9](https://github.com/orgapp/orgajs/commit/a75a6a9606421b66b6ef69b28e3fcb03a5ee282a))
- **website:** better code block ([9d5b3a2](https://github.com/orgapp/orgajs/commit/9d5b3a2d554672d22523727e89b2b5c60dc6233d))

# [2.5.0](https://github.com/orgapp/orgajs/compare/v2.4.9...v2.5.0) (2021-08-27)

### Bug Fixes

- fix examples ([bdcd265](https://github.com/orgapp/orgajs/commit/bdcd2655502a73800e8915ba09fd78452dff503f))

### Features

- **gatsby-plugin-orga:** better code block ([e6d7d20](https://github.com/orgapp/orgajs/commit/e6d7d20f63fa1871d8f53b0534b50ac6d7d99fc9))

## [2.4.9](https://github.com/orgapp/orgajs/compare/v2.4.8...v2.4.9) (2021-07-13)

**Note:** Version bump only for package gatsby-plugin-orga

## [2.4.8](https://github.com/orgapp/orgajs/compare/v2.4.7...v2.4.8) (2021-04-26)

**Note:** Version bump only for package gatsby-plugin-orga

## [2.4.7](https://github.com/orgapp/orgajs/compare/v2.4.6...v2.4.7) (2021-04-26)

**Note:** Version bump only for package gatsby-plugin-orga
