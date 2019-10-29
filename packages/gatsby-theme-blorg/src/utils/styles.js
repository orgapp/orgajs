import { readableColor } from 'polished'

const tint = amount => color =>
      readableColor(
        color,
        `rgba(0, 0, 0, ${amount})`,
        `rgba(255, 255, 255, ${amount})`)

export const withTintedBackground = theme => ({
  backgroundColor: tint(0.1)(theme.color.background),
  '&:hover': {
    backgroundColor: tint(0.2)(theme.color.background),
  }
})

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
