import React from 'react'
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
      <a href='https://github.com/orgapp/orgajs' style={{
        verticalAlign: 'middle',
      }}>
        <GithubIcon style={{
          display: 'block',
          margin: 'auto',
          fontSize: '1.4em',
        }}/>
      </a>
      <a href='https://twitter.com/xiaoxinghu' style={{
        verticalAlign: 'middle',
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
