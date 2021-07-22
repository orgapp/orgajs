/** @jsxImportSource theme-ui */
import Hightlight, { defaultProps, Language } from 'prism-react-renderer'
import React, { useContext, useState, useEffect } from 'react'
import { CodeBlockContext } from './code-block'
import { IconButton, Box, Text } from 'theme-ui'
import {
  FaClipboard as ClipboardIcon,
  FaClipboardCheck as ClipboardCheckIcon,
} from 'react-icons/fa'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import theme from 'prism-react-renderer/themes/github'

const aliases: Record<string, Language | undefined> = {
  js: 'javascript',
  sh: 'bash',
}

const Toolbar = ({ children }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: '0.6em',
        position: 'sticky',
        top: 0,
        right: 0,
        left: 0,
        color: 'gray',
        textAlign: 'center',
        zIndex: 100,
        /* border: '1px solid white', */
      }}
    >
      {children}
    </Box>
  )
}

export default (props) => {
  const { inCodeBlock } = useContext(CodeBlockContext)

  const [copied, setCopied] = useState(false)

  if (!inCodeBlock) {
    return <code {...props} />
  }

  const { className: outerClassName, children: code } = props

  const [language] = outerClassName.replace(/language-/, '').split(' ')
  const lang = aliases[language] || language

  useEffect(() => {
    const timeout = setTimeout(() => {
      setCopied(false)
    }, 2000)
    return () => clearTimeout(timeout)
  }, [copied])

  return (
    <Hightlight
      {...defaultProps}
      code={code}
      theme={theme}
      language={lang as Language}
    >
      {({ className, style, tokens, getLineProps, getTokenProps }) => (
        <pre
          sx={{
            ...style,
            position: 'relative',
            /* p: '18px', */
          }}
          className={`${outerClassName} ${className}`}
        >
          <Toolbar>
            <small
              sx={{
                bg: 'muted',
                px: 1,
                borderRadius: '2px',
                userSelect: 'none',
              }}
            >
              {lang}
            </small>
            <CopyToClipboard text={code} onCopy={() => setCopied(true)}>
              <IconButton
                sx={{
                  size: 24,
                  border: '1px solid',
                  borderColor: 'gray',
                  '&:hover': {
                    bg: 'highlight',
                    color: 'text',
                  },
                }}
              >
                {copied ? <ClipboardCheckIcon /> : <ClipboardIcon />}
              </IconButton>
            </CopyToClipboard>
          </Toolbar>
          {tokens.map((line, i) => (
            <div {...getLineProps({ line, key: i })}>
              {line.map((token, key) => (
                <span {...getTokenProps({ token, key })} />
              ))}
            </div>
          ))}
        </pre>
      )}
    </Hightlight>
  )
}
