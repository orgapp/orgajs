const styles = {
  root: {
    fontFamily: 'body',
    // fontSize: [2, 3],
    a: {
      color: 'primary',
      textDecoration: 'none',
      transition: '0.3s',
      '&:hover': {
        color: 'secondary',
      }
    },
    button: {
      transition: '0.3s',
    },
    code: {
      px: 2,
      py: 1,
      borderRadius: 4,
      bg: 'muted',
    },
    'tt,code,pre': {
      color: 'text',
      // bg: 'muted',
      // borderRadius: 4,
    },

    // --- footnotes ---
    '#footnotes': {
      p: 2,
      borderColor: 'gray',
      borderWidth: 1,
      borderTopStyle: 'solid',
      // bg: 'muted',
      position: 'relative',
    },
    '#footnotes::before': {
      color: 'gray',
      content: '"FOOTNOTES"',
      fontWeight: 900,
      fontSize: 2,
      position: 'absolute',
      top: 1,
      right: 1,
    },
    '.footnote-label': {
      fontSize: 1,
      color: 'secondary',
    },
    '.footnote-content p': {
    },
    // --- figure ---
    figure: {
      fontSize: 1,
      textAlign: 'center',
      color: 'gray',
    },
  }

}

const layout = {
  container: {},
  content: {
    maxWidth: 700,
  },
}

const badges = {
  tag: {
    transition: '0.3s',
    color: 'background',
    '&:hover': {
      bg: 'highlight',
      color: 'text',
      transform: 'scale(1.1)',
    },
  }
}

const buttons = {
  primary: {
    transition: '0.3s',
    '&:hover': {
      bg: 'secondary',
      cursor: 'pointer',
    },
  },
  icon: {
    outline: 'none',
    '&:hover': {
      cursor: 'pointer',
    },
  }
}

const cards = {
  primary: {
    padding: 3,
    maxWidth: 700,
    bg: 'muted',
    borderRadius: '1em',
    borderWidth: 1,
    borderColor: 'definition',
    borderStyle: 'solid',
    boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
    transition: '0.3s',
    '&:hover': {
      boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2)',
    },
  }
}

const colors = {
  definition: 'rgba(255, 255, 255, 0.1)',
  modes: {
    light: {
      text: '#202124',
      background: '#fff',
      primary: '#1a73e8',
      secondary: '#30c',
      muted: '#f1f3f4',
      highlight: '#efeffe',
      gray: '#777',
      accent: '#609',
    }
  }
}

export default {
  useColorSchemeMediaQuery: true,
  colors,
  fontWeights: {
    body: 400,
    heading: 900,
    bold: 700,
  },
  badges,
  buttons,
  cards,
  layout,
  styles,
}
