import test from 'node:test'
import assert from 'node:assert'
import { compile } from './compiler'

test(
  'basic org-mode parsing',
  // TODO: turn the test back on when there's a solution
  // https://github.com/nodejs/node/issues/47614
  { skip: 'bug in node test running' },
  async () => {
    const stats = await compile('fixture.org', {
      name: 'Alice',
    })

    // wait for 3 seconds
    await new Promise((resolve) => setTimeout(resolve, 3000))
    console.log('after the wait')

    // @ts-ignore
    const output = stats.toJson({ source: true }).modules[0].source
    console.log({ output })
    assert.equal(
      output,
      `
/*@jsxRuntime automatic @jsxImportSource react*/
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const title = 'hello world';

function OrgaContent(props = {}) {
  const _components = Object.assign({
    div: "div",
    h1: "h1"
  }, props.components),
        {
    wrapper: OrgaLayout
  } = _components;

  const _content = _jsx(_Fragment, {
    children: _jsxs(_components.div, {
      className: "section",
      children: [_jsxs(_components.h1, {
        children: ["headline one", " "]
      }), _jsx(_components.div, {
        style: {
          color: 'red'
        },
        children: "in a box"
      })]
    })
  });

  return OrgaLayout ? _jsx(OrgaLayout, Object.assign({
    title: title
  }, props, {
    children: _content
  })) : _content;
}

export default OrgaContent;
`
    )
  }
)
