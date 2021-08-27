import React from 'react'
import { Switch } from 'theme-ui'

const GUTTER = 2
const SIZE = 14

const BACK_COLOR = '#4a3e40'
const BUTTON_COLOR = '#c8bcc1'

const PowerSwitch = ({ checked, onChange }) => {
  return (
    <Switch
      sx={{
        borderRadius: '2px',
        bg: BACK_COLOR,
        boxShadow: 'inset 2px 2px 4px #000000',
        height: SIZE + GUTTER * 2,
        '& > div': {
          borderRadius: '2px',
          bg: BUTTON_COLOR,
          height: SIZE,
        },
        'input:checked ~ &': {
          bg: BACK_COLOR,
        },
      }}
      checked={checked}
      onChange={onChange}
    />
  )
}

export default PowerSwitch
