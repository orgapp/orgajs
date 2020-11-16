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
    '&:hover': { bg: 'secondary' },
  }
}

const buttons = {
  icon: {
    '&:hover': {
      cursor: 'pointer',
    },
  }
}

export default {
  fontWeights: {
    body: 400,
    heading: 900,
    bold: 700,
  },
  badges,
  buttons,
  layout,
  styles,
}
