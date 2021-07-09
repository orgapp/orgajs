export default {
  colors: {
    text: '#413E3D',
    gray: '#7f7f7f',
    primary: '#266691',
    secondary: '#C71F2D',
    accent: '#F7B718',
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
    bold: 600,
    heading: 700,
  },
  buttons: {
    primary: {
      color: 'background',
      bg: 'primary',
      borderRadius: '0.4em',
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
      pre: {
        bg: 'highlight',
        p: 2,
        borderRadius: 4,
        width: '100%',
        overflowX: 'scroll',
      }
    },
  },
}
