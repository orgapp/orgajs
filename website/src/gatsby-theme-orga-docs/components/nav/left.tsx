import React from 'react'
import {
  FaGithub as GithubIcon,
  FaTwitter as TwitterIcon,
} from 'react-icons/fa'
import { IconContext } from 'react-icons/lib/cjs'

export default () => {

  return (
    <IconContext.Provider value={{ size: '2em', style: {
      verticalAlign: 'middle',
    }}}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1em',
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
      </div>
    </IconContext.Provider>
  )
}
