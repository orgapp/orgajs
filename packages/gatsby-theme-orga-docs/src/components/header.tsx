/** @jsx jsx */
import { Flex, jsx } from 'theme-ui'

export default ({ left = undefined, right = undefined }: { left?: any, right?: any }) => {

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
      <Flex>{left}</Flex>
      <Flex>{right}</Flex>
    </header>
  )
}

