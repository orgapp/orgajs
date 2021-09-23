import { jsx } from 'theme-ui'
import Prism from '@theme-ui/prism'
const components = {
  pre: (props) => props.children,
  code: (props) => {
    console.log(`code class: ${props.className}`)
    return props.className && props.className.includes('language')
      ? Prism(props)
      : jsx('code', props)
  },
}

export default {}
