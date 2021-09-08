import { Declaration, Expression, Identifier, Literal } from 'estree'

const layoutBuilder = (name = 'OrgaLayout') => {
  let _layout: any
  const id = { type: 'Identifier', name }

  const setDefaultLayout = (
    params: { local: Identifier; source: Literal } | string
  ) => {
    const { local, source } =
      typeof params === 'string'
        ? {
            local: { type: 'Identifier', name: 'default' },
            source: {
              type: 'Literal',
              value: params,
              raw: `'${params}'`,
            },
          }
        : params

    _layout = {
      type: 'ImportDeclaration',
      specifiers: [
        local.name === 'default'
          ? { type: 'ImportDefaultSpecifier', local: id }
          : {
              type: 'ImportSpecifier',
              imported: local,
              local: id,
            },
      ],
      source: {
        type: 'Literal',
        value: source.value,
        raw: source.raw,
      },
    }
  }

  const declareLayout = (
    declaration: Declaration | Expression | undefined = undefined
  ) => {
    if (_layout) return _layout
    const init = { type: 'Literal', value: 'wrapper', raw: '"wrapper"' }
    _layout = {
      type: 'VariableDeclaration',
      declarations: [
        { type: 'VariableDeclarator', id: id, init: declaration || init },
      ],
      kind: 'const',
    }
    return _layout
  }

  const getLayout = () => [declareLayout()]

  return {
    setDefaultLayout,
    declareLayout,
    getLayout,
  }
}

export default layoutBuilder
