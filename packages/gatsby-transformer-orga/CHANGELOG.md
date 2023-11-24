# Change Log

## 3.2.2

### Patch Changes

- Updated dependencies [7cfff79a]
  - orga@4.3.0
  - oast-to-hast@4.1.2
  - orga-posts@3.2.2

## 3.2.1

### Patch Changes

- Updated dependencies [ac322714]
  - orga@4.2.0
  - oast-to-hast@4.1.1
  - orga-posts@3.2.1

## 3.2.0

### Minor Changes

- 4d8efbb7: Add increamental parsing ability for the editor.

### Patch Changes

- Updated dependencies [4d8efbb7]
  - oast-to-hast@4.1.0
  - orga-posts@3.2.0
  - orga@4.1.0

## 3.1.9

### Patch Changes

- Updated dependencies [176a3b5d]
  - oast-to-hast@4.0.0
  - orga@4.0.0
  - orga-posts@3.1.9

## 3.1.8

### Patch Changes

- Updated dependencies [eeccc870]
  - oast-to-hast@3.2.1
  - orga@3.2.1
  - orga-posts@3.1.8

## 3.1.7

### Patch Changes

- Updated dependencies [6c1ddb9f]
  - oast-to-hast@3.2.0
  - orga@3.2.0
  - orga-posts@3.1.7

## 3.1.6

### Patch Changes

- 4bde5155: tidy up dependencies
- Updated dependencies [4bde5155]
  - orga@3.1.5
  - orga-posts@3.1.6
  - oast-to-hast@3.1.6

## 3.1.5

### Patch Changes

- Updated dependencies [ae83a3b0]
  - oast-to-hast@3.1.5
  - orga@3.1.4
  - orga-posts@3.1.5

## 3.1.4

### Patch Changes

- Updated dependencies [09a3b5c6]
  - orga@3.1.3
  - oast-to-hast@3.1.4
  - orga-posts@3.1.4

## 3.1.3

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

- Updated dependencies [594bf16b]
  - orga@3.1.2
  - oast-to-hast@3.1.3
  - orga-posts@3.1.3

## 3.1.2

### Patch Changes

- Updated dependencies [19156b8a]
  - oast-to-hast@3.1.2
  - orga@3.1.1
  - orga-posts@3.1.2

## 3.1.1

### Patch Changes

- Updated dependencies [7f209ff5]
  - oast-to-hast@3.1.1
  - orga-posts@3.1.1

## 3.1.0

### Minor Changes

- eeea0c54: introduce new token: empty line

### Patch Changes

- Updated dependencies [eeea0c54]
  - oast-to-hast@3.1.0
  - orga@3.1.0
  - orga-posts@3.1.0

## 3.0.2

### Patch Changes

- 0119c613: add missing files in gatsby-transformer-orga

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

- Updated dependencies [6ed76057]
- Updated dependencies [759e6149]
  - oast-to-hast@3.0.1
  - orga@3.0.1
  - orga-posts@3.0.1

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
  - oast-to-hast@3.0.0
  - orga@3.0.0
  - orga-posts@3.0.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.6.0](https://github.com/orgapp/orgajs/compare/v2.5.0...v2.6.0) (2021-08-28)

### Bug Fixes

- remove prepublish step individually ([a75a6a9](https://github.com/orgapp/orgajs/commit/a75a6a9606421b66b6ef69b28e3fcb03a5ee282a))
- **website:** better code block ([9d5b3a2](https://github.com/orgapp/orgajs/commit/9d5b3a2d554672d22523727e89b2b5c60dc6233d))

# [2.5.0](https://github.com/orgapp/orgajs/compare/v2.4.9...v2.5.0) (2021-08-27)

**Note:** Version bump only for package gatsby-transformer-orga

## [2.4.9](https://github.com/orgapp/orgajs/compare/v2.4.8...v2.4.9) (2021-07-13)

**Note:** Version bump only for package gatsby-transformer-orga

## [2.4.8](https://github.com/orgapp/orgajs/compare/v2.4.7...v2.4.8) (2021-04-26)

**Note:** Version bump only for package gatsby-transformer-orga

## [2.4.7](https://github.com/orgapp/orgajs/compare/v2.4.6...v2.4.7) (2021-04-26)

**Note:** Version bump only for package gatsby-transformer-orga
