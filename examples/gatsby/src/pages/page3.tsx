import React, { FC } from 'react'
import image from '../images/logo.png'

const Page3: FC<unknown> = () => {
  return (
    <div>
      <h1>React Page</h1>
      <img alt="icon" src={image} />
      <p>This is a react page.</p>
    </div>
  )
}

export default Page3
