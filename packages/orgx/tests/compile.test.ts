import { describe, it } from 'node:test'
import assert from 'node:assert'
import { compile } from '../src/compile'

const fixture = `
#+title: Hello World
* Hi
`
const code = `
/*@jsxRuntime classic @jsx React.createElement @jsxFrag React.Fragment*/
import React from "react";
export const title = 'Hello World';
function _createOrgaContent(props) {
  const _components = Object.assign({
    div: "div",
    h1: "h1"
  }, props.components);
  return <_components.div className="section"><_components.h1>{"Hi"}{" "}</_components.h1></_components.div>;
}
function OrgaContent(props = {}) {
  const {wrapper: OrgaLayout} = props.components || ({});
  return OrgaLayout ? <OrgaLayout {...props}><_createOrgaContent {...props} /></OrgaLayout> : _createOrgaContent(props);
}
export default OrgaContent;
`

describe('compile', () => {
  it('can compile org file', async () => {
    const result = await compile(fixture, {
      jsxRuntime: 'classic',
      jsx: true,
      outputFormat: 'program',
    })

    assert.strictEqual(`${result}`.trim(), code.trim())
  })
})
