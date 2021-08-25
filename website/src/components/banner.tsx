/** @jsxImportSource theme-ui */
import { useEffect, useState } from 'react'
import { animated, useSpring } from 'react-spring'
import useSound from 'use-sound'
import startupSound from '../sounds/startup.m4a'
import Switch from './switch'

const H_GUT = '60px'

const Strips = ({ sx }) => (
  <div
    sx={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      height: '100%',
      width: '100%',
      ...sx,
    }}
  >
    <div sx={{ px: '1em' }}>
      <div
        sx={{ bg: 'purple', borderRadius: 3, height: 6, width: '100%' }}
      ></div>
      <div sx={{ bg: 'transparent', height: 3, width: '100%' }}></div>
      <div sx={{ bg: 'blue', borderRadius: 1, height: 2, width: '100%' }}></div>
    </div>
  </div>
)

const Banner = ({
  slogan = 'taking org-mode to the moon',
  children,
  ...props
}) => {
  const mute = '#bebebe'

  const [isOn, turnOn] = useState(true)
  const [play] = useSound(startupSound)
  const [flyin, animate] = useSpring({
    opacity: isOn ? 1 : 0,
    marginTop: isOn ? 0 : -300,
    reset: true,
    cancel: !isOn,
    config: {
      duration: 4000,
    },
  })

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
          gridTemplateColumns: `${H_GUT} auto ${H_GUT}`,
          gridTemplateRows: '30px auto 30px',
          gridTemplateAreas: `
"top top topR"
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
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gridArea: 'top',
            color: mute,
            // margin: 'auto 0',
          }}
        >
          <Strips sx={{ flexGrow: 1 }} />
          <div sx={{ flexShrink: 0 }}>{slogan}</div>
        </div>
        <Strips sx={{ gridArea: 'topR' }} />
        <div
          sx={{
            gridArea: 'left',
            color: mute,
            alignSelf: 'center',
          }}
        >
          <div
            sx={{
              height: 10,
              width: 10,
              backgroundColor: isOn ? 'red' : '#222328',
              borderRadius: '50%',
              margin: 'auto',
              marginBottom: '1em',
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
            height: '10em',
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
