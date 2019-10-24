import React from 'react'

export default ({ children }) => {
  return (
    <footer css={theme => ({
      padding: `5.0rem 1.5rem`,
      display: `flex`,
      flexDirection: `column`,
      alignItems: `center`,
    })}>
      {/* <div css={theme => ({ */}
      {/*   display: 'flex', */}
      {/*   maxWidth: theme.maxWidth, */}
      {/*   margin: '0 auto', */}
      {/* })}> */}
      {/* </div> */}
      { children }
    </footer>
  )
}
