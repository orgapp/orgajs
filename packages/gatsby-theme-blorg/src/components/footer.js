import React from 'react'
import { css } from '@emotion/core'

export default ({ children }) => {
  return (
    <footer css={css`
      padding: 5.0em 1.5em;
      display: flex;
      flex-direction: column;
      align-items: center;
      @media print: { display: none };
      @media screen and (max-width: 450px) {
        padding: 3em 0;
      }
    `}>
      { children }
    </footer>
  )
}
