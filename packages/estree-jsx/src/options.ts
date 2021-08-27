export interface Options {
  skipExport: boolean
  wrapExport: boolean
  pragma: string
  renderer: string
}

export const DEFAULT_OPTIONS: Options = {
  skipExport: false,
  wrapExport: false,
  pragma: `/* @jsxRuntime classic */
/* @jsx orga */
/* @jsxFrag orga.Fragment */`,
  renderer: `import React from 'react'
import {orga} from '@orgajs/react'`,
}
