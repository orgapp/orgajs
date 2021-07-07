export default {
  colors: {
    text: '#333',
    primary: '#3E6991',
    secondary: '#FF6D6A',
    // primary: '#03A9F4',
    // secondary: '#FFC107',
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
        bg: 'secondary',
      },
      cursor: 'pointer',
    },
    link: {
      color: 'primary',
      bg: 'background',
      '&:hover': {
        bg: 'highlight',
      },
      cursor: 'pointer',
    }
  },
  links: {
    nav: {
      px: 2,
      py: 1,
      // textTransform: 'uppercase',
      '&:hover': {
        bg: 'highlight',
      },
      borderRadius: '0.2em',
    },
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
