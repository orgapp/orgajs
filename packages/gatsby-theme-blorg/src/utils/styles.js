import { readableColor, lighten, darken } from 'polished'

export const highlighted = ({ highlightOnHover = false } = {}) => theme => {
  const { highlight } = theme.color
  const style = {
    backgroundColor: highlight,
  }
  return highlightOnHover ? {
    ...style,
    '&:hover': {
      ...tinted({ color: highlight })(theme)
    }
  } : style
}

export const tinted = ({ amount = 0.1, color } = {}) => theme => {
  const _color = color || theme.color.background
  return {
    backgroundColor: readableColor(
      _color,
      darken(amount, _color),
      lighten(amount, _color))
  }
}

export const likeButton = theme => ({
  textAlign: 'center',
  padding: '.2em 1.5em',
  color: theme.color.primary,
  border: 'none',
  backgroundColor: 'inherit',
  textDecoration: 'none',
  display: 'inline-block',
  cursor: 'pointer',
  '&:hover': {
    color: theme.color.secondary,
  },
  '&:focus': {
    outline: 0,
  },
})

export const compose = (...fns) => theme => {
  return fns.reduce((result, f) => {
    let o = f
    if (typeof o === 'function') {
      o = f(theme)
    }
    return {
      ...result,
      ...o,
    }
  }, {})
}
