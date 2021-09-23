import { OrgaProvider } from '@orgajs/react'
import Image from 'next/image'
import Link from 'next/link'
import { AppProps } from 'next/app'

const components = {
  a: Link, // enables client side transitions
  img: Image, // enables nextjs image optimization
}

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <OrgaProvider components={components}>
      <Component {...pageProps} />
    </OrgaProvider>
  )
}

export default MyApp
