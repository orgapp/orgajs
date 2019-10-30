const common = {
  maxWidth: 672,
}

module.exports = [
  {
    ...common,
    dark: true,
    color: {
      text: 'hsl(210, 50%, 96%)',
      background: 'hsl(230, 25%, 18%)',
      primary: 'hsl(260, 100%, 80%)',
      secondary: 'hsl(290, 100%, 80%)',
      highlight: 'hsl(260, 20%, 40%)',
      purple: 'hsl(290, 100%, 80%)',
      muted: 'hsla(230, 20%, 0%, 20%)',
      gray: 'hsl(210, 50%, 60%)',
    },
    code: `solarizedlight`,
  },
  {
    ...common,
    color: {
      text: 'hsl(10, 20%, 20%)',
      background: 'hsl(10, 10%, 98%)',
      primary: 'hsl(10, 80%, 50%)',
      secondary: 'hsl(10, 60%, 50%)',
      highlight: 'hsl(10, 40%, 90%)',
      purple: 'hsl(250, 60%, 30%)',
      muted: 'hsl(10, 20%, 94%)',
      gray: 'hsl(10, 20%, 50%)',
    },
  },
]
