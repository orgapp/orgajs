# Change Log

## 3.1.10

### Patch Changes

- Updated dependencies [6c1ddb9f]
  - gatsby-plugin-orga@3.2.6

## 3.1.9

### Patch Changes

- 4bde5155: tidy up dependencies
- Updated dependencies [4bde5155]
  - gatsby-plugin-orga@3.2.5
  - gatsby-plugin-orga-theme-ui@1.0.2
  - @orgajs/theme-ui@1.0.2

## 3.1.8

### Patch Changes

- gatsby-plugin-orga@3.2.4

## 3.1.7

### Patch Changes

- gatsby-plugin-orga@3.2.3

## 3.1.6

### Patch Changes

- gatsby-plugin-orga@3.2.2

## 3.1.5

### Patch Changes

- gatsby-plugin-orga@3.2.1

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
  - gatsby-plugin-orga@3.2.0
  - gatsby-plugin-orga-theme-ui@1.0.1
  - @orgajs/theme-ui@1.0.1

## 3.1.3

### Patch Changes

- Updated dependencies [19156b8a]
  - gatsby-plugin-orga@3.1.3

## 3.1.2

### Patch Changes

- gatsby-plugin-orga@3.1.2

## 3.1.1

### Patch Changes

- gatsby-plugin-orga@3.1.1

## 3.1.0

### Minor Changes

- eeea0c54: introduce new token: empty line

### Patch Changes

- Updated dependencies [eeea0c54]
  - gatsby-plugin-orga@3.1.0

## 3.0.3

### Patch Changes

- Updated dependencies [6ed76057]
- Updated dependencies [759e6149]
  - gatsby-plugin-orga@3.0.3

## 3.0.2

### Patch Changes

- Updated dependencies [b3f5197]
  - gatsby-plugin-orga@3.0.2

## 3.0.1

### Patch Changes

- Updated dependencies [d55bc8b]
  - gatsby-plugin-orga@3.0.1

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
  - gatsby-plugin-orga@3.0.0

All notable changes to this project will be documented in this file.
See [Conventional Commits](https://conventionalcommits.org) for commit guidelines.

# [2.6.0](https://github.com/orgapp/orgajs/compare/v2.5.0...v2.6.0) (2021-08-28)

**Note:** Version bump only for package gatsby-theme-orga-docs

# [2.5.0](https://github.com/orgapp/orgajs/compare/v2.4.9...v2.5.0) (2021-08-27)

### Bug Fixes

- fix phrasing content in headline ([31ca41c](https://github.com/orgapp/orgajs/commit/31ca41cb3b9b65a19dbc71a906f86ee4d725ad8f))

## [2.4.9](https://github.com/orgapp/orgajs/compare/v2.4.8...v2.4.9) (2021-07-13)

**Note:** Version bump only for package gatsby-theme-orga-docs

## [2.4.8](https://github.com/orgapp/orgajs/compare/v2.4.7...v2.4.8) (2021-04-26)

**Note:** Version bump only for package gatsby-theme-orga

## [2.4.7](https://github.com/orgapp/orgajs/compare/v2.4.6...v2.4.7) (2021-04-26)

**Note:** Version bump only for package gatsby-theme-orga
