/** @jsx jsx */
import { PageProps } from 'gatsby'
import { get } from 'lodash'
import { useState } from 'react'
import { IconButton, jsx, MenuButton } from 'theme-ui'
import Nav from './nav'
import SEO from './seo'
import Side from './side'

const HEADER_HEIGHT = '48px'
const SIDEBAR_WIDTH = '250px'

export default ({ children, pageContext }: PageProps) => {
  const title = get(pageContext, 'properties.title')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div
      sx={{
        display: 'grid',
        gridTemplateColumns: ['0 1fr', `${SIDEBAR_WIDTH} 1fr`],
        gridTemplateRows: `${HEADER_HEIGHT} 1fr`,
        alignContent: 'stretch',
        backgroundColor: 'background',
        width: '100vw',
        height: '100vh',
        gridTemplateAreas: `
      'aside header'
      'aside content'
      `,
      }}
    >
      <SEO />
      <nav
        sx={{
          gridArea: 'header',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid`,
          borderColor: `muted`,
          marginX: '0.2em',
          gap: '0.2em',
        }}
      >
        <MenuButton
          aria-label="toggle sidebar"
          sx={{
            display: ['block', 'none'],
            '&:hover': {
              bg: 'highlight',
            },
          }}
          onClick={() => setSidebarOpen(!sidebarOpen)}
        />
        <Nav />
      </nav>
      <aside
        sx={{
          display: 'block',
          position: ['fixed', 'static'],
          top: 0,
          left: `-${SIDEBAR_WIDTH}`,
          width: SIDEBAR_WIDTH,
          gridArea: 'aside',
          height: '100%',
          overflow: 'auto',
          borderRight: `1px solid`,
          borderColor: `muted`,
          backgroundColor: 'surface',
          padding: '1em',
          zIndex: 200,
          transform: `translateX(${sidebarOpen ? SIDEBAR_WIDTH : '0'})`,
          transition: 'transform 0.3s ease-out',
          boxShadow: [
            sidebarOpen ? '1px 0px 7px rgba(0,0,0,0.5)' : 'none',
            'none',
          ],
        }}
      >
        {sidebarOpen && (
          <div
            sx={{
              display: 'flex',
              position: 'sticky',
              top: 0,
              justifyContent: 'flex-end',
              mb: '0.4em',
            }}
          >
            <IconButton
              onClick={() => setSidebarOpen(false)}
              sx={{
                '&:hover': {
                  bg: 'highlight',
                },
              }}
            >
              <div
                style={{
                  transform: 'rotate(45deg)',
                  fontSize: '1.5em',
                }}
              >
                +
              </div>
            </IconButton>
          </div>
        )}
        <Side />
      </aside>
      {sidebarOpen && (
        <div
          style={{
            position: 'fixed',
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.4)',
            zIndex: 100,
            top: 0,
            right: 0,
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <main
        sx={{
          gridArea: 'content',
          height: '100%',
          overflow: 'auto',
          p: 4,
        }}
      >
        {title && <h1 sx={{ fontSize: 6 }}>{title}</h1>}
        {children}
      </main>
    </div>
  )
}
