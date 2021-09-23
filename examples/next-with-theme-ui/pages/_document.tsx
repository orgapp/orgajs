/** @jsxImportSource theme-ui */
import Document, { Html, Head, Main, NextScript } from 'next/document'
import { Box, InitializeColorMode } from 'theme-ui'

export default class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx)
    return { ...initialProps }
  }

  render() {
    return (
      <Html>
        <Head />
        <body>
          <InitializeColorMode />
          <Box>
            <Main />
          </Box>
          <NextScript />
        </body>
      </Html>
    )
  }
}
