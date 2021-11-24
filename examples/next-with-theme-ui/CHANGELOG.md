# @orgajs/example-next-with-theme-ui

## 1.0.8

### Patch Changes

- Updated dependencies [eeccc870]
  - @orgajs/next@3.1.11
  - @orgajs/loader@3.1.10

## 1.0.7

### Patch Changes

- @orgajs/loader@3.1.9
- @orgajs/next@3.1.10

## 1.0.6

### Patch Changes

- 4bde5155: tidy up dependencies
- Updated dependencies [4bde5155]
  - @orgajs/loader@3.1.8
  - @orgajs/next@3.1.9
  - @orgajs/theme-ui@1.0.2

## 1.0.5

### Patch Changes

- @orgajs/loader@3.1.7
- @orgajs/next@3.1.8

## 1.0.4

### Patch Changes

- @orgajs/loader@3.1.6
- @orgajs/next@3.1.7

## 1.0.3

### Patch Changes

- @orgajs/loader@3.1.5
- @orgajs/next@3.1.6

## 1.0.2

### Patch Changes

- @orgajs/loader@3.1.4
- @orgajs/next@3.1.5

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

- Updated dependencies [594bf16b]
  - @orgajs/loader@3.1.3
  - @orgajs/next@3.1.4
  - @orgajs/theme-ui@1.0.1
