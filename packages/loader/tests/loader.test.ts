import compiler from './compiler'

test('basic org-mode parsing', async () => {
  const stats = await compiler('fixture.org', {
    name: 'Alice',
  })
  // @ts-ignore
  const output = stats.toJson({ source: true }).modules[0].source
  expect(output).toMatchInlineSnapshot(`
"/*@jsxRuntime automatic @jsxImportSource react*/
import { Fragment as _Fragment, jsx as _jsx, jsxs as _jsxs } from \\"react/jsx-runtime\\";
export const title = 'hello world';

function OrgaContent(props = {}) {
  const _components = Object.assign({
    div: \\"div\\",
    h1: \\"h1\\"
  }, props.components),
        {
    wrapper: OrgaLayout
  } = _components;

  const _content = _jsx(_Fragment, {
    children: _jsxs(_components.div, {
      className: \\"section\\",
      children: [_jsxs(_components.h1, {
        children: [\\"headline one\\", \\" \\"]
      }), _jsx(_components.div, {
        style: {
          color: 'red'
        },
        children: \\"in a box\\"
      })]
    })
  });

  return OrgaLayout ? _jsx(OrgaLayout, Object.assign({
    title: title
  }, props, {
    children: _content
  })) : _content;
}

export default OrgaContent;"
`)
})
