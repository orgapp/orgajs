export const DEFAULT_OPTIONS = {
  skipExport: false,
  wrapExport: false,
  renderer: `import React from 'react'
import {orga} from '@orgajs/react'
`,
  pragma: `/* @jsxRuntime classic */
/* @jsx orga */
/* @jsxFrag orga.Fragment */
`
}

export type Options = typeof DEFAULT_OPTIONS
