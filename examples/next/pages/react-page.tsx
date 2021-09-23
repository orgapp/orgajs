import Banner, { words } from '../components/banner.org'

const ReactPage = () => {
  return (
    <div>
      <Banner />
      <h1>Hello World</h1>
      <main style={{ padding: '1em' }}>This is a react page.</main>
      <div
        style={{
          color: 'white',
          background: '#3685b5',
          padding: '0.2em 1em',
        }}
      >
        {words}
      </div>
    </div>
  )
}

export default ReactPage
