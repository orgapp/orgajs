const common = {
  maxWidth: 672,
}

module.exports = [
  {
    ...common,
    dark: true,
    color: {
      text: '#fff',
      background: 'hsl(180, 5%, 15%)',
      primary: 'hsl(180, 100%, 57%)',
      secondary: 'hsl(50, 100%, 57%)',
      accent: 'hsl(310, 100%, 57%)',
      muted: 'hsl(180, 5%, 5%)',
      gray: 'hsl(180, 0%, 70%)',
    },
    code: `solarizedlight`,
  },
  {
    ...common,
    color: {
      text: `hsl(10, 20%, 20%)`,
      background: `hsl(10, 10%, 98%)`,
      primary: `hsl(10, 80%, 50%)`,
      secondary: `hsl(10, 60%, 50%)`,
      accent: `hsl(10, 60%, 50%)`,
      muted: `hsl(10, 20%, 50%)`,
      gray: `hsl(10, 20%, 50%)`,
    },
  },
]
