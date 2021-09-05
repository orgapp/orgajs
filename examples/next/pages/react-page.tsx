/** @jsxImportSource theme-ui */
import Banner, { words } from '../components/banner.org'

const ReactPage = () => {
  return (
    <div>
      <Banner />
      <main sx={{ p: '1em' }}>This is a react page.</main>
      <div
        sx={{
          color: 'white',
          bg: '#3685b5',
          px: '1em',
          py: '0.2em',
        }}
      >
        {words}
      </div>
    </div>
  )
}

export default ReactPage
