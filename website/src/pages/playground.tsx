/* @jsx jsx */
import Playground from '@orgajs/playground'
import { Link, PageProps } from 'gatsby'
import SEO from 'gatsby-theme-orga-docs/src/components/seo'
import { parse as parseQueryString } from 'query-string'
import { FC, useEffect, useState } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { FaCheck as CheckIcon, FaLink as LinkIcon } from 'react-icons/fa'
import { Button, Flex, jsx, NavLink, Select } from 'theme-ui'
import examples from '../examples'

/* const decode = decodeURIComponent */
const encode = encodeURIComponent

const ThePlayground: FC<PageProps> = ({ location }) => {
  const q = parseQueryString(location.search)

  const [code, setCode] = useState((q.text as string) || examples[0].code)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setCopied(false)
  }, [code])

  const loadExample = (index) => {
    const example = examples[index].code
    setCode(example.trim())
  }

  return (
    <div
      sx={{
        display: 'grid',
        height: '100vh',
        gridTemplateRows: '58px 1fr',
      }}
    >
      <SEO title="playground" />
      <div
        sx={{
          display: 'flex',
          alignItems: 'center',
          padding: '0 1em',
        }}
      >
        <Flex sx={{ gap: '1em', alignItems: 'center' }}>
          <Select
            sx={{ width: 300 }}
            onChange={(e) => loadExample(e.target.value)}
          >
            {examples.map((e, i) => {
              return (
                <option key={`example-${i}`} value={i}>
                  {e.name}
                </option>
              )
            })}
          </Select>
          <NavLink as={Link} to="/">
            Documentation
          </NavLink>
          <NavLink href="https://github.com/orgapp/orgajs">Source Code</NavLink>
        </Flex>
        <Flex sx={{ marginLeft: 'auto', justifyContent: 'flex-end' }}>
          <CopyToClipboard
            text={`${location.origin}${location.pathname}?text=${encode(code)}`}
            onCopy={() => setCopied(true)}
          >
            <Button
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4em',
                backgroundColor: copied ? '#339933' : 'primary',
              }}
            >
              {copied ? <CheckIcon /> : <LinkIcon />}
              {copied ? 'Copied to Clipboard' : 'Generate Permalink'}
            </Button>
          </CopyToClipboard>
        </Flex>
      </div>
      <div>
        <Playground style={{ height: 'calc(100% - 20px)' }} onChange={setCode}>
          {code}
        </Playground>
      </div>
    </div>
  )
}

export default ThePlayground
