import Typography from "typography"
import CodePlugin from 'typography-plugin-code'

const theme = {
  title: 'dawn',
  baseFontSize: "16px",
  baseLineHeight: 1.666,
  headerFontFamily: [
    "Avenir Next",
    "Helvetica Neue",
    "Segoe UI",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
  bodyFontFamily: ["system-ui", "sans-serif"],
  scaleRatio: 2,
  bodyColor: "hsla(0,0%,0%,0.8)",
  headerWeight: 700,
  blockMarginBottom: 1 / 2,
  overrideStyles: ({ rhythm }) => ({
    h1: {
      paddingBottom: `calc(${rhythm(1 / 4)} - 1px)`,
      marginBottom: rhythm(3 / 4),
      marginTop: rhythm(1.5),
    },
    h2: {
      paddingBottom: `calc(${rhythm(1 / 4)} - 1px)`,
      marginBottom: rhythm(1 / 4),
      marginTop: rhythm(1),
    },
    "h3,h4,h5,h6": {
      marginBottom: rhythm(1 / 2),
      marginTop: rhythm(1),
    },
  }),
}

theme.plugins = [ new CodePlugin() ]

const typography = new Typography(theme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles()
}

export default typography
