import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import OrgaRenderer from './orga-renderer'

const GoldenLayout = ({ children }) => (
  <div style={{ backgroundColor: 'gold' }}>
    <h1>This is GOLD</h1>
    {children}
  </div>
)

export default (body) => {
  const wrappedElement = (
    <OrgaRenderer scope={{ Box: GoldenLayout }}>{body}</OrgaRenderer>
  )

  return renderToStaticMarkup(wrappedElement)
}
