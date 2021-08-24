/** @jsxImportSource theme-ui */

const Banner = ({ slogan, children }) => {
  const mute = '#bebebe'

  return (
    <div
      sx={{
        display: 'grid',
        gridTemplateColumns: '60px auto 60px',
        gridTemplateRows: '30px auto 30px',
        gridTemplateAreas: `
"top top top"
"left screen right"
"bottom bottom bottom"
      `,
        fontFamily: 'system-ui',
        textAlign: 'center',
        backgroundColor: '#808080',
        border: '1px solid #535745',
        borderRadius: '0.8em 0.8em 5em 0.8em',
        textTransform: 'uppercase',
        fontSize: '10px',
      }}
    >
      <div
        sx={{
          gridArea: 'top',
          color: mute,
          textAlign: 'right',
          margin: 'auto 60px',
        }}
      >
        {slogan || 'taking org-mode to the moon'}
      </div>
      <div
        sx={{
          gridArea: 'left',
          color: mute,
        }}
      >
        <div
          sx={{
            height: 10,
            width: 10,
            backgroundColor: 'red',
            borderRadius: '50%',
            margin: 'auto',
            marginTop: '30px',
            marginBottom: '10px',
          }}
        ></div>
        battery
      </div>
      <div
        sx={{
          padding: '2em',
          backgroundColor: '#9bbc12',
          border: '1px solid #535745',
          gridArea: 'screen',
          color: '#214812',
          fontFamily: 'Game Boy',
          fontSize: '15px',
          boxShadow: 'inset 5px 5px 10px #000000',
        }}
      >
        {children}
      </div>
      <div sx={{ gridArea: 'right' }}></div>
    </div>
  )
}

export default Banner
