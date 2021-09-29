# @orgajs/example-gatsby-with-theme-ui

## 3.0.10

### Patch Changes

- gatsby-plugin-orga@3.2.2
- @orgajs/loader@3.1.5

## 3.0.9

### Patch Changes

- gatsby-plugin-orga@3.2.1
- @orgajs/loader@3.1.4

## 3.0.8

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
  - @orgajs/loader@3.1.3
  - @orgajs/theme-ui@1.0.1