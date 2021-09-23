import { jsx } from '@theme-ui/core'
export {
  jsx,
  __ThemeUIContext,
  merge,
  useThemeUI,
  createElement,
} from '@theme-ui/core'
export type {
  ThemeUIContextValue,
  IntrinsicSxElements,
  SxProp,
  ColorMode,
  ColorModesScale,
  CSSObject,
  CSSProperties,
  CSSPseudoSelectorProps,
  ResponsiveStyleValue,
  ThemeUICSSProperties,
  ThemeUIStyleObject,
  ThemeUICSSObject,
  Theme,
  ThemeStyles,
  TLengthStyledSystem,
  StylePropertyValue,
} from '@theme-ui/core'
export { useColorMode, InitializeColorMode } from '@theme-ui/color-modes'
export * from '@theme-ui/components'
export { css, get } from '@theme-ui/css'

export const BaseStyles = (props: Record<string, unknown>) =>
  jsx('div', {
    ...props,
    sx: {
      fontFamily: 'body',
      lineHeight: 'body',
      fontWeight: 'body',
      variant: 'styles',
    },
  })

// orga version
export { components, Themed } from './orga'
export { ThemeProvider } from './theme-provider'
