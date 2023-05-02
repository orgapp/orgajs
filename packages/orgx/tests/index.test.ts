import { describe, it } from 'node:test'
import assert from 'node:assert'
import { compileSync } from '../src/compile'

const fixture = `
#+title: Hello World
* Hi
`
const code = `/*@jsxRuntime classic @jsx createElement @jsxFrag Fragment*/
import {createElement, Fragment} from "react";
export const title = 'Hello World';
function OrgaContent(props = {}) {
  const _components = Object.assign({
    div: "div",
    h1: "h1"
  }, props.components), {wrapper: OrgaLayout} = _components;
  const _content = <><_components.div className="section"><_components.h1>{"Hi"}{" "}</_components.h1></_components.div></>;
  return OrgaLayout ? <OrgaLayout title={title} {...props}>{_content}</OrgaLayout> : _content;
}
export default OrgaContent;
`

describe('compile', () => {
  it('works', () => {
    const result = compileSync(fixture, {
      jsxRuntime: 'classic',
      jsx: true,
      outputFormat: 'program',
      pragma: { name: 'createElement', source: 'react' },
      pragmaFrag: { name: 'Fragment', source: 'react' },
    })

    assert.strictEqual(`${result}`, code)
  })
})
