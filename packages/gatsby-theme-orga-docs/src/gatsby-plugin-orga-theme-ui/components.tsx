import { jsx } from 'theme-ui'
import Prism from '@theme-ui/prism'
const components = {
  pre: (props) => props.children,
  code: (props) =>
    props.className && props.className.includes('language')
      ? Prism(props)
      : jsx('code', props),
}

export default components
