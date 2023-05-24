import { describe, it } from 'node:test'
import * as assert from 'node:assert'
import { compile } from '../lib/compile.js'

const fixture = `
#+title: Hello World
* Hi
`
const code = `
/*@jsxRuntime classic @jsx React.createElement @jsxFrag React.Fragment*/
import React from "react";
export const title = 'Hello World';
function _createOrgContent(props) {
  const _components = Object.assign({
    div: "div",
    h1: "h1"
  }, props.components);
  return <_components.div className="section"><_components.h1>{"Hi"}{" "}</_components.h1></_components.div>;
}
function OrgContent(props = {}) {
  const {wrapper: OrgLayout} = props.components || ({});
  return OrgLayout ? <OrgLayout {...props}><_createOrgContent {...props} /></OrgLayout> : _createOrgContent(props);
}
export default OrgContent;
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
