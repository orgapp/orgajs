import React from 'react'
import Layout from './layout'
import Bio from './bio'
import Footer from './footer'
import { useSiteMetadata } from '../hooks'
import { readableColor } from 'polished'

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
    <a href={link} css={theme => ({
      display: 'block',
      width: '100%',
      textAlign: 'center',
      margin: '0 auto 16px',
      fontSize: '1.4em',
      padding: '16px 0',
      borderRadius: '0.3em',
      backgroundColor: tint(0.1)(theme.color.background),
      '&:hover': {
        backgroundColor: tint(0.2)(theme.color.background),
      }
    })}>
      Tweet this.
    </a>
  )
}

export default ({ title, slug, body, location }) => {
  return (
    <Layout location={location}>
      <main>
        <h1>{ title }</h1>
        <div dangerouslySetInnerHTML={{ __html: body }} />
      </main>
      <Footer>
        <TweetThisButton title={title} slug={slug} />
        <hr css={ theme => ({
          backgroundColor: tint(0.3)(theme.color.background),
          width: '100%' }) }/>
        <Bio/>
      </Footer>
    </Layout>
  )
}
