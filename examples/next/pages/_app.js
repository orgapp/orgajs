import { OrgaProvider } from '@orgajs/react'
import Link from 'next/link'
import Image from 'next/image'

const components = {
  Link,
  Image,
  img: Image,
}

function MyApp({ Component, pageProps }) {
  return (
    <OrgaProvider components={components}>
      <Component {...pageProps} />
    </OrgaProvider>
  )
}

export default MyApp
