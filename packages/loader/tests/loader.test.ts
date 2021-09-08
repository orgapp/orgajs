import toJsx from '@orgajs/estree-jsx'
import toEstree from '@orgajs/rehype-estree'
import toRehype from '@orgajs/reorg-rehype'
import compiler from './compiler'

test('basic org-mode parsing', async () => {
  const stats = await compiler('fixture.org', {
    name: 'Alice',
    plugins: [toRehype, toEstree, toJsx],
  })
  // @ts-ignore
  const output = stats.toJson({ source: true }).modules[0].source
  expect(output).toMatchInlineSnapshot(`
"import _extends from \\"@babel/runtime/helpers/extends\\";

/* @jsxRuntime classic */

/* @jsx orga */

/* @jsxFrag orga.Fragment */
import React from 'react';
import { orga } from '@orgajs/react';

const makeShortcode = name => props => {
  console.warn(\\"Component \`%s\` was not imported, exported, or provided by OrgaProvider as global scope\\", name);
  return orga(\\"div\\", props);
};

const Box = makeShortcode(\\"Box\\");
export const title = 'hello orga';
const OrgaLayout = \\"wrapper\\";

function OrgaContent({
  components,
  ...props
}) {
  return orga(OrgaLayout, _extends({
    components: components
  }, props), orga(\\"div\\", {
    className: \\"section\\"
  }, orga(\\"h1\\", {
    parentName: \\"div\\"
  }, \\"headline one\\", \\" \\"), orga(\\"p\\", {
    parentName: \\"div\\"
  }, \\"The box does not exist.\\", \\" \\"), orga(Box, {
    parentName: \\"div\\",
    orgaType: \\"Box\\"
  }, \\"in a box\\")));
}

OrgaContent.isOrgaComponent = true;
export default OrgaContent;"
`)
})
