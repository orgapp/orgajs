import React from 'react'
import Header from './header'
import { Link, useStaticQuery, graphql } from 'gatsby'

export default ({ title, children }) => {
  return (
    <div>
      <Header title={title}/>
      { children }
    </div>
  )
}
