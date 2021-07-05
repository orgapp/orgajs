export default {
  colors: {
    text: '#333',
    primary: '#0083C3',
    secondary: '#FF8674',
    background: '#ffffff',
    surface: '#f9f9f9',
    muted: '#e0e0e0',
    highlight: '#e6e6e7',
  },
  fonts: {
    body: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading: 'Georgia, serif',
    monospace: 'Menlo, monospace',
  },
  fontWeights: {
    body: 400,
    heading: 700,
  },
  buttons: {
    primary: {
      color: 'background',
      bg: 'primary',
      '&:hover': {
        bg: 'text',
      },
      cursor: 'pointer',
    },
    link: {
      color: 'primary',
      bg: 'surface',
    }
  },
  styles: {
    root: {
      fontFamily: 'body',
      fontWeight: 'body',
      a: {
        color: 'primary',
        textDecoration: 'none',
        '&:hover': {
          color: 'secondary',
        },
      },
    },
  },
}
