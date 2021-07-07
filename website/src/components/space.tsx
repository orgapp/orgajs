/** @jsx jsx */
import { keyframes } from '@emotion/react'
import { jsx } from 'theme-ui'
import stars from '../images/stars.png'
import twinkling from '../images/twinkling.png'

const moveTwinkling = keyframes`
from {background-position: 0 0, 0 0;}
to {background-position: -10000px 5000px, 100% 0;}
`

const moveContent = keyframes`
0% {left:0px; top:0px}
2% {left:0px; top:0px}
`

const Space = ({ children, style }) => {
  const ambient = '#0af'
  return (
    <div sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      width: '100%',
      padding: '1em',
      backgroundColor: '#000',
      backgroundImage: `url(${twinkling}), url(${stars})`,
      backgroundPosition: 'top center, left center',
      backgroundRepeat: 'repeat, repeat',
      textAlign: 'center',
      animation: `${moveTwinkling} 200s linear infinite`,
      color: '#fff',
      height: '180px',
      borderRadius: '0.8em',
      alignText: 'center',
      fontSize: '1.2em',
      textShadow: `
      0 0 7px #fff,
      0 0 10px #fff,
      0 0 21px #fff,
      0 0 42px #0fa,
      0 0 82px #0fa,
      0 0 92px #0fa,
      0 0 102px #0fa,
      0 0 151px #0fa
      `
    }}>
      <div sx={{
        animatio: `${moveContent} 4s linear infinite`,
      }}>
        {children}
      </div>
    </div>
  )
}

export default Space
