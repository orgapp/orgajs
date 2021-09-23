import React, { FC } from 'react'
import image from '../images/logo.png'
import { Link } from 'gatsby'

const Page3: FC<unknown> = () => {
  return (
    <div>
      <h1>React Page</h1>
      <img alt="icon" src={image} />
      <p>This is a react page.</p>
      <Link to="/">go back</Link>
    </div>
  )
}

export default Page3
