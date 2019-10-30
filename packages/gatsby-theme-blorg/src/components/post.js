import React from 'react'
import Layout from './layout'
import Bio from './bio'
import Footer from './footer'
import { useSiteMetadata } from '../hooks'
import { readableColor } from 'polished'
import { compose, highlighted } from '../utils/styles'

const tint = amount => color =>
      readableColor(
        color,
        `rgba(0, 0, 0, ${amount})`,
        `rgba(255, 255, 255, ${amount})`)

const objectToGetParams = object => {
  return '?' + Object.keys(object)
    .filter(key => !!object[key])
    .map(key => `${key}=${encodeURIComponent(object[key])}`)
    .join('&')
}

const TweetThisButton = ({ title, slug }) => {
  const { siteUrl, twitter } = useSiteMetadata()
  if (!twitter || twitter.length === 0) return null
  const link = `https://twitter.com/intent/tweet` + objectToGetParams({
    text: title,
    url: `${siteUrl}${ slug }`,
    via: twitter,
  })

  return (
    <a href={link} css={compose({
      display: 'block',
      width: '100%',
      textAlign: 'center',
      margin: '0 auto 16px',
      fontSize: '1.4em',
      padding: '16px 0',
      borderRadius: '0.3em',
    }, highlighted({ highlightOnHover: true }))}>
      Tweet this.
    </a>
  )
}

export default ({ title, date, slug, body, location }) => {
  const { author } = useSiteMetadata()
  return (
    <Layout location={location}>
      <main>
        <div css={{
          display: 'flex',
          flexDirection: 'column',
          padding: '1em 2em 0',
          textAlign: 'center',
        }}>
          <time css={theme => ({
            color: theme.color.gray,
            marginBottom: '-2em',
          })}>{ date }</time>
          <h1 css={{ fontSize: '40px' }}>{ title }</h1>
          <hr css={theme => ({ backgroundColor: theme.color.gray })}/>
        </div>
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </main>
      <Footer>
        <TweetThisButton title={title} slug={slug} />
        <hr css={ theme => ({
          backgroundColor: tint(0.3)(theme.color.background),
          width: '100%' }) }/>
        <Bio/>
        <p>
          © {new Date().getFullYear()} {author}
        </p>
      </Footer>
    </Layout>
  )
}