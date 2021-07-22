/** @jsx jsx */
import { IconButton, jsx, useColorMode } from 'theme-ui'
import { FaSun as LightIcon, FaMoon as DarkIcon } from 'react-icons/fa'
import { IconContext } from 'react-icons'

export default () => {
  const [colorMode, setColorMode] = useColorMode()
  return (
    <IconButton
      onClick={() => setColorMode(colorMode === 'default' ? 'dark' : 'default')}
    >
      <IconContext.Provider
        value={{
          size: '1.5em',
          style: {},
        }}
      >
        {colorMode === 'default' ? <LightIcon /> : <DarkIcon />}
      </IconContext.Provider>
    </IconButton>
  )
}
