import { ThemeProvider } from '@orgajs/theme-ui'
import type { AppProps } from 'next/app'
import Image from 'next/image'
import NextLink from 'next/link'
import type { FC } from 'react'
import theme from '../theme'

const Link: FC<{ href: string }> = (props) => {
  return (
    <NextLink href={props.href}>
      <a {...props} />
    </NextLink>
  )
}

const components = {
  a: Link,
  img: Image,
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider theme={theme} components={components}>
      <Component {...pageProps} />
    </ThemeProvider>
  )
}

export default MyApp
