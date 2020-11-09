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
  }
}

const layout = {
  container: {
    maxWidth: 900,
  }
}

export default {
  fontWeights: {
    body: 400,
    heading: 900,
    bold: 700,
  },
  layout,
  styles,
}
