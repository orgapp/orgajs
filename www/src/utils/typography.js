import ReactDOM from 'react-dom/server'
import React from 'react'
import Typography from 'typography'
import theme from 'typography-theme-github'
import CodePlugin from 'typography-plugin-code'
import { MOBILE_MEDIA_QUERY } from 'typography-breakpoint-constants'

const options = {
  baseFontSize: '14px',
  baseLineHeight: 1.45,
  scaleRatio: 2.25,
  plugins: [new CodePlugin()],
  overrideStyles: ({ rhythm, scale }, options) => ({
    [MOBILE_MEDIA_QUERY]: {
      // Make baseFontSize on mobile 16px.
      html: {
        fontSize: `${16 / 16 * 100}%`,
      },
    },
  }),
}

theme.baseFontSize = '14px'
theme.baseLineHeight = 1.45
theme.scaleRatio = 2.25
theme.plugins = [
  new CodePlugin(),
]

const typography = new Typography(theme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles()
}

export default typography
