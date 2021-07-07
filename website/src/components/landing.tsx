/** @jsx jsx */
import { jsx } from 'theme-ui'
import { get } from 'lodash'

export default ({children, pageContext}) => {
  const title = get(pageContext, 'properties.title')
  return (
    <div>
      <div sx={{
        maxWidth: 768,
        mx: 'auto',
      }}>
        <h1 sx={{
          fontSize: 6,
          textAlign: 'center',
        }}>{title}</h1>
        {children}
      </div>
    </div>
  )
}
