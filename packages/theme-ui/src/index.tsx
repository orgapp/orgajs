import React from 'react'
import {
  jsx as coreJsx,
  ThemeProvider as CoreProvider,
  ThemeProviderProps as CoreThemeProviderProps,
  useThemeUI,
  __themeUiDefaultContextValue,
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
import { css, Theme } from '@theme-ui/css'
import { OrgaProvider, OrgaProviderComponents } from './orga-provider'
import { ColorModeProvider } from '@theme-ui/color-modes'
import { Global } from '@emotion/react'
export * from '@theme-ui/components'
export { useColorMode, InitializeColorMode } from '@theme-ui/color-modes'

interface ThemeProviderProps extends Pick<CoreThemeProviderProps, 'theme'> {
  children?: React.ReactNode
  components?: OrgaProviderComponents
}

export { Themed, components } from './orga-provider'

export const jsx = coreJsx

const RootStyles = () =>
  jsx(Global, {
    styles: (emotionTheme) => {
      const theme = emotionTheme as Theme
      const { useRootStyles } = theme.config || theme

      if (useRootStyles === false || (theme.styles && !theme.styles.root)) {
        return null
      }

      const boxSizing =
        theme.config?.useBorderBox === false ? undefined : 'border-box'

      return css({
        '*': {
          boxSizing,
        },
        html: {
          variant: 'styles.root',
        },
        body: {
          margin: 0,
        },
      })(theme)
    },
  })
export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  theme,
  components,
  children,
}) => {
  const outer = useThemeUI()

  const isTopLevel = outer === __themeUiDefaultContextValue
  return (
    <CoreProvider theme={theme}>
      <ColorModeProvider>
        {isTopLevel && <RootStyles />}
        <OrgaProvider components={components}>{children}</OrgaProvider>
      </ColorModeProvider>
    </CoreProvider>
  )
}
