/** @jsx jsx */
import React from 'react'
import { jsx } from 'theme-ui'
import { Link } from 'gatsby'
import { Button } from 'theme-ui'
import {
  FaGithub as GithubIcon,
  FaTwitter as TwitterIcon,
} from 'react-icons/fa'

export default () => {

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: '1em',
      width: '100%',
      padding: '0 1em',
    }}>
      <a href='https://github.com/orgapp/orgajs' sx={{
        verticalAlign: 'middle',
        color: 'gray',
        '&:hover': {
          color: 'text',
        }
      }}>
        <GithubIcon style={{
          display: 'block',
          margin: 'auto',
          fontSize: '1.4em',
        }}/>
      </a>
      <a href='https://twitter.com/xiaoxinghu' sx={{
        verticalAlign: 'middle',
        color: 'gray',
        '&:hover': {
          color: 'text',
        }
      }}>
        <TwitterIcon style={{
          display: 'block',
          margin: 'auto',
          fontSize: '1.4em',
        }}/>
      </a>
      <Link to='/playground' style={{
      }}>
        <Button>
          Playground
        </Button>
      </Link>
    </div>
  )
}
