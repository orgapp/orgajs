# Change Log

## 3.1.8

### Patch Changes

- @orgajs/playground@3.1.8
- gatsby-theme-orga-docs@3.1.8

## 3.1.7

### Patch Changes

- @orgajs/playground@3.1.7
- gatsby-theme-orga-docs@3.1.7

## 3.1.6

### Patch Changes

- @orgajs/playground@3.1.6
- gatsby-theme-orga-docs@3.1.6

## 3.1.5

### Patch Changes

- @orgajs/playground@3.1.5
- gatsby-theme-orga-docs@3.1.5

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
  - gatsby-theme-orga-docs@3.1.4
  - @orgajs/playground@3.1.4

## 3.1.3

### Patch Changes

- gatsby-theme-orga-docs@3.1.3
- @orgajs/playground@3.1.3

## 3.1.2

### Patch Changes

- Updated dependencies [8c6f440b]
  - @orgajs/playground@3.1.2
  - gatsby-theme-orga-docs@3.1.2

## 3.1.1

### Patch Changes

- @orgajs/playground@3.1.1
- gatsby-theme-orga-docs@3.1.1

## 3.1.0

### Minor Changes

- eeea0c54: introduce new token: empty line

### Patch Changes

- Updated dependencies [eeea0c54]
  - gatsby-theme-orga-docs@3.1.0
  - @orgajs/playground@3.1.0

## 3.0.3

### Patch Changes

- Updated dependencies [6ed76057]
- Updated dependencies [759e6149]
  - @orgajs/playground@3.0.1
  - gatsby-theme-orga-docs@3.0.3

## 3.0.2

### Patch Changes

- gatsby-theme-orga-docs@3.0.2

## 3.0.1

### Patch Changes

- gatsby-theme-orga-docs@3.0.1

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
  - gatsby-theme-orga-docs@3.0.0
  - @orgajs/playground@3.0.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.6.0](https://github.com/gatsbyjs/gatsby-starter-default/compare/v2.5.0...v2.6.0) (2021-08-28)

**Note:** Version bump only for package @orgajs/website

# [2.5.0](https://github.com/gatsbyjs/gatsby-starter-default/compare/v2.4.9...v2.5.0) (2021-08-27)

### Bug Fixes

- **website:** better code block ([9d5b3a2](https://github.com/gatsbyjs/gatsby-starter-default/commit/9d5b3a2d554672d22523727e89b2b5c60dc6233d))

### Features

- better code block in website ([3efe4cd](https://github.com/gatsbyjs/gatsby-starter-default/commit/3efe4cd96a63623e2f70028bd66346960ec90bec))

## [2.4.9](https://github.com/gatsbyjs/gatsby-starter-default/compare/v2.4.8...v2.4.9) (2021-07-13)

**Note:** Version bump only for package @orgajs/website
