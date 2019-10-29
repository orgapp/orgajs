import Typography from "typography"
import CodePlugin from 'typography-plugin-code'

const typography = new Typography({
  baseFontSize: "18px",
  baseLineHeight: 1.666,
  scaleRatio: 2,
  headerFontFamily: [
    "Avenir Next",
    "Helvetica Neue",
    "Segoe UI",
    "Helvetica",
    "Arial",
    "sans-serif",
  ],
  bodyFontFamily: ["Georgia", "serif"],
  blockMarginBottom: 1 / 2,
  plugins: [ new CodePlugin() ],
})

// Hot reload typography in development.
if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles()
}

export default typography
