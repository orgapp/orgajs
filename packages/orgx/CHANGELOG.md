# @orgajs/orgx

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
