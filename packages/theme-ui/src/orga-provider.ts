import styled, { StyledComponent } from '@emotion/styled'
import { OrgaProvider as _OrgaProvider, useOrgaComponents } from '@orgajs/react'
import { IntrinsicSxElements, jsx } from '@theme-ui/core'
import { css, get, Theme } from '@theme-ui/css'
import {
  ComponentProps,
  ComponentType,
  DetailedHTMLProps,
  ElementType,
  FC,
  HTMLAttributes,
  ReactNode,
  useEffect,
} from 'react'

type OrgaProviderComponentsKnownKeys = {
  [key in keyof IntrinsicSxElements]?: ComponentType<any> | string
}
export interface OrgaProviderComponents
  extends OrgaProviderComponentsKnownKeys {
  [key: string]: ComponentType<any> | string | undefined
}
export type OrgaAliases = {
  [key in keyof IntrinsicSxElements]: keyof JSX.IntrinsicElements
}

export type OrgaAliasesKeys = 'root'

export type ThemedProps = {
  theme: Theme
}

export interface OrgaProviderProps {
  components?: OrgaProviderComponents
  children: ReactNode
}

// hast components
const tags: Array<keyof IntrinsicSxElements> = [
  'p',
  'b',
  'i',
  'a',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'img',
  'pre',
  'code',
  'ol',
  'ul',
  'li',
  'blockquote',
  'hr',
  'em',
  'table',
  'tr',
  'th',
  'td',
  'em',
  'strong',
  'del',
  // other
  'div',
  // theme-ui
  'root',
]

const aliases = {
  inlineCode: 'code',
  thematicBreak: 'hr',
  root: 'div',
} as const

type Aliases = typeof aliases
const isAlias = (x: string): x is keyof Aliases => x in aliases

export type ThemedComponentName =
  | keyof IntrinsicSxElements
  | keyof JSX.IntrinsicElements

const alias = (n: ThemedComponentName): keyof JSX.IntrinsicElements =>
  isAlias(n) ? aliases[n] : n

const propOverrides: {
  [key in Partial<ThemedComponentName>]?: Record<string, string>
} = {
  th: {
    align: 'textAlign',
  },
  td: {
    align: 'textAlign',
  },
}
export const themed =
  (key: ThemedComponentName) =>
  ({ theme, ...rest }: ThemedProps) => {
    const propsStyle = propOverrides[key]

    const extraStyles = propsStyle
      ? Object.keys(rest)
          .filter((prop) => propsStyle[prop] !== undefined)
          .reduce(
            (acc, prop) => ({
              ...acc,
              [propsStyle[prop]]: (rest as Record<string, string>)[prop],
            }),
            {}
          )
      : undefined
    return css({ ...get(theme, `styles.${key}`), ...extraStyles })(theme)
  }

// opt out of typechecking whenever `as` prop is used
interface AnyComponentProps extends JSX.IntrinsicAttributes {
  [key: string]: unknown
}

export type WithPoorAsProp<
  Props,
  As extends ElementType | undefined = undefined
> = {
  as?: As
} & (undefined extends As
  ? As extends undefined
    ? Props
    : AnyComponentProps
  : AnyComponentProps)

export interface ThemedComponent<Name extends ElementType> {
  <As extends ElementType | undefined = undefined>(
    props: WithPoorAsProp<ComponentProps<Name>, As>
  ): JSX.Element
}

export type ThemedComponentsDict = {
  [K in keyof IntrinsicSxElements]: K extends keyof Aliases
    ? ThemedComponent<Aliases[K]>
    : K extends keyof JSX.IntrinsicElements
    ? ThemedComponent<K>
    : never
}

type ThemedDiv = StyledComponent<
  DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
  ThemedProps,
  Theme
>

export const Themed: ThemedDiv & ThemedComponentsDict = styled('div')(
  themed('div')
) as ThemedDiv & ThemedComponentsDict

export const components = {} as ThemedComponentsDict

tags.forEach((tag) => {
  // fixme?
  components[tag] = styled(alias(tag))(themed(tag)) as any
  Themed[tag] = components[tag] as any
})

const createComponents = (comps: OrgaProviderComponents) => {
  const next = { ...components }

  const componentKeys = Object.keys(comps) as Array<keyof IntrinsicSxElements>

  componentKeys.forEach((key) => {
    (next[key] as ThemedComponentsDict[typeof key]) = styled<any>(comps[key])(
      themed(key)
    ) as ThemedComponentsDict[typeof key]
  })
  return next
}

export const OrgaProvider: FC<OrgaProviderProps> = ({
  components,
  children,
}) => {
  const outer = useOrgaComponents({}) as OrgaProviderComponents
  return jsx(_OrgaProvider, {
    components: createComponents({ ...outer, ...components }),
    children,
  })
}
