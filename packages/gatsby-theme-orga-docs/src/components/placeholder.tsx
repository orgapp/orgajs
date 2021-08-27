/** @jsx jsx */
import { jsx } from 'theme-ui'

const colors = ['#F9E267', '#332F21']

export default ({ children, style = {} }) => (
  <div
    sx={{
      display: 'flex',
      justifyContent: 'center',
      color: '#DA1984',
      width: '100%',
      padding: '0.3em',
      border: '3px solid #000',
      background: `repeating-linear-gradient(
-55deg,
${colors[0]},
${colors[0]} 20px,
${colors[1]} 20px,
${colors[1]} 40px
)`,
      /* filter: 'brightness(80%)', */
      ...style,
    }}
  >
    <div
      sx={{
        backdropFilter: 'blur(10px)',
        color: 'white',
        padding: '0.2em 0.4em',
        margin: 'auto',
        fontWeight: 'bold',
        borderRadius: '0.1em',
      }}
    >
      {children}
    </div>
  </div>
)
