import React from "react"
import { Link } from "gatsby"

const Banner = ({ children }) => (
  <h1>
    <Link to='/'>{ children }</Link>
  </h1>
)

export default ({ children, title }) => {
  return (
    <header>
      <div>
        <Banner>{ title }</Banner>
        { children }
      </div>
    </header>
  )
}
