/** @jsx jsx */
import React from 'react'
import { jsx } from 'theme-ui'

const Section = ({ children }) => <div style={{ display: 'flex' }}>{children}</div>

export default ({ left, right }) => {

  return (
    <header sx={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderBottom: `1px solid`,
      borderColor: `muted`,
      gridArea: 'header',
      marginX: '1em',
    }}>
      <Section>{left}</Section>
      <Section>{right}</Section>
    </header>
  )
}

