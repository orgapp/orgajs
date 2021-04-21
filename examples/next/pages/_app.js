import { OrgaProvider } from '@orgajs/react'

function MyApp({ Component, pageProps }) {
  return (
    <OrgaProvider components={{}}>
      <Component {...pageProps} />
    </OrgaProvider>
  )
}

export default MyApp
