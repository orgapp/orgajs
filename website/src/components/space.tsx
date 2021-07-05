/** @jsx jsx */
import { css, jsx, keyframes } from '@emotion/react'
import stars from '../images/stars.png'
import twinkling from '../images/twinkling.png'

const moveTwinkling = keyframes`
from {background-position: 0 0, 0 0;}
to {background-position: -10000px 5000px, 100% 0;}
`

const Space = ({ children }) => {
  const ambient = '#0af'
  return (
    <div css={css`
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 1em;
    background-color: #000;
    background-image: url(${twinkling}), url(${stars});
    background-position: top center, left center;
    background-repeat: repeat, repeat;
    text-align: center;
    animation: ${moveTwinkling} 200s linear infinite;
    color: #fff;
    height: 180px;
    border-radius: 0.8em;
    align-text: center;
    font-size: 1.2em;
    `}>
      {children}
    </div >
  )
}

export default Space
