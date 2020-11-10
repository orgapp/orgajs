const styles = {
  root: {
    fontFamily: 'body',
    a: {
      color: 'primary',
      textDecoration: 'none',
      transition: '0.3s',
      '&:hover': {
        color: 'secondary',
      }
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
  }
}

const layout = {
  container: {
    maxWidth: 700,
  }
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
