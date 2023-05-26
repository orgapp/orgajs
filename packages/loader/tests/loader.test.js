import test from 'node:test'
import * as assert from 'node:assert'
import { compile } from './compiler.js'

test('basic org-mode parsing', async () => {
  const stats = await compile('fixture.org', {
    name: 'Alice',
  })

  // wait for 3 seconds
  await new Promise((resolve) => setTimeout(resolve, 3000))
  console.log('after the wait')

  const output = stats.toJson({ source: true }).modules[0].source
  assert.equal(
    output.trim(),
    `
/*@jsxRuntime automatic @jsxImportSource react*/
import {jsx as _jsx, jsxs as _jsxs} from "react/jsx-runtime";
export const title = 'hello world';
function _createOrgContent(props) {
  const _components = Object.assign({
    div: "div",
    h1: "h1"
  }, props.components);
  return _jsxs(_components.div, {
    className: "section",
    children: [_jsxs(_components.h1, {
      children: ["headline one", " "]
    }), _jsx(_components.div, {
      style: {
        color: 'red'
      },
      children: "in a box"
    })]
  });
}
function OrgContent(props = {}) {
  const {wrapper: OrgLayout} = props.components || ({});
  return OrgLayout ? _jsx(OrgLayout, Object.assign({}, props, {
    children: _jsx(_createOrgContent, props)
  })) : _createOrgContent(props);
}
export default OrgContent;
`.trim()
  )
})
