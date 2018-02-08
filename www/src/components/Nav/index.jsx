import React from 'react'
import Link from 'gatsby-link'
import style from './_style.module.scss'

const Header = () => (
  <div className={style.container}>
    <Link to='/ast' className={style.item}>AST</Link>
    <Link to='/docs' className={style.item}>Docs</Link>
  </div>
)

export default Header
