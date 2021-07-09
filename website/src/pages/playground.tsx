import React, { useState, useEffect } from 'react'
import Playground from '@orgajs/playground'
import { Link } from 'gatsby'
import { Button, NavLink } from 'theme-ui'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { parse as parseQueryString } from 'query-string'
import {
  FaLink as LinkIcon,
  FaCheck as CheckIcon,
} from 'react-icons/fa'
import SEO from 'gatsby-theme-orga-docs/src/components/seo'

const decode = decodeURIComponent
const encode = encodeURIComponent

export default ({ location }) => {
  const q = parseQueryString(location.search)

  const [code, setCode] = useState((q.text as string) || `* Hello World

Enter org-mode content here.

#+begin_src javascript
console.log('this is orga')
#+end_src
`)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCopied(false)
  }, [code])

  const Box = ({children, style}) => <div style={{
    display: 'flex',
    flex: 1,
    justifyContent: 'center',
    ...style,
  }}>{children}</div>

  return (
    <div style={{
      display: 'grid',
      height: '100vh',
      gridTemplateRows: '42px 1fr',
    }}>
      <SEO title='playground'/>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '0 1em',
      }}>
        <Box style={{marginRight: 'auto', justifyContent: 'flex-start', gap: '0.2em'}}>
          <NavLink as={Link} to='/'>
            Documentation
          </NavLink>
          <NavLink href='https://github.com/orgapp/orgajs'>
            Source Code
          </NavLink>
        </Box>
        <Box style={{color: '#68737e'}}>
          orgajs playground
        </Box>
        <Box style={{marginLeft: 'auto', justifyContent: 'flex-end'}}>
          <CopyToClipboard text={`${location.origin}${location.pathname}?text=${encode(code)}`} onCopy={() => setCopied(true)}>
            <Button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.4em',
              backgroundColor: copied ? '#339933' : 'primary',
            }}>
              {copied ? <CheckIcon/> : <LinkIcon/>}
              {copied ? 'Copied to Clipboard' : 'Generate Permalink'}
            </Button>
          </CopyToClipboard>
        </Box>
      </div>
      <Playground
        style={{ height: 'calc(100% - 20px)' }}
        code={code}
        onChange={(code) => setCode(code)}/>
    </div>
  )
}
