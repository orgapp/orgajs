import { OrgaProvider } from '@orgajs/react'
import Box from '../components/box'

function MyApp({ Component, pageProps }) {
  return (
    <OrgaProvider components={{ Box }}>
      <Component {...pageProps} />
    </OrgaProvider>
  )
}

export default MyApp
