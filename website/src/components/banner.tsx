/** @jsxImportSource theme-ui */
import { useEffect, useState } from 'react'
import useSound from 'use-sound'
import startupSound from '../sounds/startup.m4a'
import Switch from './switch'
import { useSpring, animated } from 'react-spring'

const Banner = ({
  slogan = 'taking org-mode to the moon',
  children,
  ...props
}) => {
  const mute = '#bebebe'

  const [isOn, turnOn] = useState(true)
  const [play] = useSound(startupSound)
  const flyin = useSpring({
    opacity: isOn ? 1 : 0,
    marginTop: isOn ? 0 : -300,
    config: {
      duration: 4000,
    },
  })

  let timer

  const powerToggled = () => {
    turnOn(!isOn)
  }

  useEffect(() => {
    if (isOn) {
      play()
      /* timer = setTimeout(() => {
       *   setShowContent(true)
       * }, 1500)
       * return () => {
       *   clearTimeout(timer)
       * } */
    } else {
      /* setShowContent(false)
       * clearTimeout(timer) */
    }
  }, [isOn])

  return (
    <div {...props}>
      <Switch checked={isOn} onChange={powerToggled} />
      <div
        sx={{
          margin: '0.5em 0',
          display: 'grid',
          gridTemplateColumns: '60px auto 60px',
          gridTemplateRows: '30px auto 30px',
          gridTemplateAreas: `
"top top top"
"left screen right"
"bottom bottom bottom"
        `,
          fontFamily: 'system-ui',
          textAlign: 'center',
          backgroundColor: '#808080',
          border: '1px solid #535745',
          borderRadius: '0.8em 0.8em 5em 0.8em',
          textTransform: 'uppercase',
          fontSize: '10px',
        }}
      >
        <div
          sx={{
            gridArea: 'top',
            color: mute,
            textAlign: 'right',
            margin: 'auto 60px',
          }}
        >
          {slogan}
        </div>
        <div
          sx={{
            gridArea: 'left',
            color: mute,
          }}
        >
          <div
            sx={{
              height: 10,
              width: 10,
              backgroundColor: isOn ? 'red' : '#222328',
              borderRadius: '50%',
              margin: 'auto',
              marginTop: '30px',
              marginBottom: '10px',
            }}
          ></div>
          battery
        </div>
        <div
          sx={{
            padding: '2em',
            backgroundColor: isOn ? '#9bbc12' : '#6f6c0c',
            border: '1px solid #535745',
            gridArea: 'screen',
            color: '#214812',
            fontFamily: 'Game Boy',
            fontSize: '15px',
            minHeight: 100,
            boxShadow: 'inset 5px 5px 10px #000000',
            overflow: 'hidden',
          }}
        >
          {isOn && <animated.div style={flyin}>{children}</animated.div>}
        </div>
        <div sx={{ gridArea: 'right' }}></div>
      </div>
    </div>
  )
}

export default Banner
