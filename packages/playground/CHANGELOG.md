# Change Log

## 3.1.4

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
  - @orgajs/orgx@1.0.1

## 3.1.3

### Patch Changes

- Updated dependencies [19156b8a]
  - @orgajs/rehype-estree@3.0.4
  - @orgajs/reorg-rehype@3.0.4
  - @orgajs/reorg@3.1.1

## 3.1.2

### Patch Changes

- 8c6f440b: - better layout support
  - rename MDXxxx to Orgaxxx
- Updated dependencies [8c6f440b]
- Updated dependencies [4baa1f93]
- Updated dependencies [e8d61a98]
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
  - @orgajs/reorg@3.1.0
  - @orgajs/reorg-rehype@3.0.2

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
  - @orgajs/estree-jsx@3.0.1
  - @orgajs/rehype-estree@3.0.1
  - @orgajs/reorg@3.0.1
  - @orgajs/reorg-rehype@3.0.1

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
  - @orgajs/react@3.0.0
  - @orgajs/rehype-estree@3.0.0
  - @orgajs/reorg@3.0.0
  - @orgajs/reorg-rehype@3.0.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.6.0](https://github.com/orgapp/orgajs/compare/v2.5.0...v2.6.0) (2021-08-28)

**Note:** Version bump only for package @orgajs/playground

# [2.5.0](https://github.com/orgapp/orgajs/compare/v2.4.9...v2.5.0) (2021-08-27)

### Bug Fixes

- lock unified & @types/unist version ([dc72217](https://github.com/orgapp/orgajs/commit/dc72217f0cfcd778436d704021116c8479f8ee1e))

## [2.4.9](https://github.com/orgapp/orgajs/compare/v2.4.8...v2.4.9) (2021-07-13)

**Note:** Version bump only for package @orgajs/playground
