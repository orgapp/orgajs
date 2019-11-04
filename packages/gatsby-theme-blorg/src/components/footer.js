import React from 'react'

export default ({ children }) => {
  return (
    <footer css={theme => ({
      padding: `5.0rem 1.5rem`,
      display: `flex`,
      flexDirection: `column`,
      alignItems: `center`,
      '@media print': { display: 'none' },
    })}>
      { children }
    </footer>
  )
}
