# @orgajs/astro

## 1.3.3

### Patch Changes

- Updated dependencies [a53cfea]
  - @orgajs/metadata@2.4.0
  - @orgajs/rollup@1.3.3

## 1.3.2

### Patch Changes

- Updated dependencies [60ad38f]
  - @orgajs/rollup@1.3.2

## 1.3.1

### Patch Changes

- @orgajs/rollup@1.3.1

## 1.3.0

### Minor Changes

- 188d30f: - migrate most of modules to js
  - fix types during the process
  - remove unmaintained modules

### Patch Changes

- Updated dependencies [188d30f]
  - @orgajs/metadata@2.3.0
  - @orgajs/rollup@1.3.0

## 1.2.2

### Patch Changes

- Updated dependencies [e3ef3a5]
  - @orgajs/rollup@1.2.2

## 1.2.1

### Patch Changes

- @orgajs/rollup@1.2.1

## 1.2.0

### Minor Changes

- d8861c2: update unified ecosystem

### Patch Changes

- Updated dependencies [d8861c2]
  - @orgajs/metadata@2.2.0
  - @orgajs/rollup@1.2.0

## 1.1.3

### Patch Changes

- @orgajs/rollup@1.1.3

## 1.1.2

### Patch Changes

- @orgajs/rollup@1.1.2

## 1.1.1

### Patch Changes

- ac322714: implement editor
  - @orgajs/rollup@1.1.1

## 1.1.0

### Minor Changes

- 4d8efbb7: Add increamental parsing ability for the editor.

### Patch Changes

- Updated dependencies [4d8efbb7]
  - @orgajs/metadata@2.1.0
  - @orgajs/rollup@1.1.0

## 1.0.3

### Patch Changes

- 49b4f258: add options to astro plugin

## 1.0.2

### Patch Changes

- a20ef1fd: fix an import issue when generating code in astro

## 1.0.1

### Patch Changes

- @orgajs/rollup@1.0.1

## 1.0.0

### Major Changes

- 176a3b5d: # Migrate most of the ecosystem to ESM

  We are excited to announce that we have migrated most of our ecosystem to ESM! This move was necessary as the unified ecosystem had already transitioned to ESM, leaving our orgajs system stuck on an older version if we wanted to stay on commonjs. We understand that this transition may come with some inevitable breaking changes, but we have done our best to make it as gentle as possible.

  In the past, ESM support in popular frameworks like webpack, gatsby, and nextjs was problematic, but the JS world has steadily moved forward, and we are now in a much better state. We have put in a lot of effort to bring this project up to speed, and we are happy to say that it's in a pretty good state now.

  We acknowledge that there are still some missing features that we will gradually add back over time. However, we feel that the changes are now in a great state to be released to the world. If you want to use the new versions, we recommend checking out the `examples` folder to get started.

  We understand that this upgrade path may not be compatible with older versions, and we apologize for any inconvenience this may cause. However, we encourage you to consider starting fresh, as the most important part of your site should always be your content (org-mode files). Thank you for your understanding, and we hope you enjoy the new and improved ecosystem!

### Patch Changes

- Updated dependencies [176a3b5d]
  - @orgajs/metadata@2.0.0
  - @orgajs/rollup@1.0.0
