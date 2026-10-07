---
'@orgajs/orgx': patch
'orga-build': patch
---

Escape metadata and media paths in generated code. `#+title: Don't panic` produced `export const title = 'Don't panic'`, a syntax error that failed the build; keywords that aren't valid identifiers (`#+1st:`, `#+class:`) are now skipped instead of breaking the module. In orga-build, an image or video whose file name contains a quote (`[[./it's.png]]`) no longer breaks the page.
