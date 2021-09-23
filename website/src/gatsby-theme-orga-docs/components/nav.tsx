/** @jsx jsx */
import { Link } from 'gatsby'
import React from 'react'
import {
  FaGithub as GithubIcon,
  FaTwitter as TwitterIcon,
} from 'react-icons/fa'
import { Button, jsx, Themed } from 'theme-ui'

const Nav: React.FC = () => {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        gap: '1em',
        width: '100%',
        padding: '0 1em',
      }}
    >
      <Themed.a
        href="https://github.com/orgapp/orgajs"
        sx={{
          verticalAlign: 'middle',
          color: 'gray',
          '&:hover': {
            color: 'text',
          },
        }}
      >
        <GithubIcon
          style={{
            display: 'block',
            margin: 'auto',
            fontSize: '1.4em',
          }}
        />
      </Themed.a>
      <Themed.a
        href="https://twitter.com/xiaoxinghu"
        sx={{
          verticalAlign: 'middle',
          color: 'gray',
          '&:hover': {
            color: 'text',
          },
        }}
      >
        <TwitterIcon
          style={{
            display: 'block',
            margin: 'auto',
            fontSize: '1.4em',
          }}
        />
      </Themed.a>
      <Link to="/playground">
        <Button>Playground</Button>
      </Link>
    </div>
  )
}

export default Nav
