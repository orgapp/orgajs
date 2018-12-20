import styled from 'styled-components'
import Link from './link'
import PropTypes from 'prop-types'
import React from 'react'
import typography from '../utils/typography'
const { rhythm } = typography

const Container = styled.header`
padding-top: 3rem;
padding-bottom: 2rem;
`

const MenuItem = styled(Link)`
display: block;
text-decoration: none;
border-radius: 0.4rem;
padding: .5rem 1.5rem;
text-align: center;
&:hover {
  text-decoration: none;
  cursor: pointer;
  background-color: #f1f1f1;
}
`

const Menu = styled.div`
display: flex;
justify-content: center;
`

const Title = styled.h1`
color: gray;
margin: 0 auto;
padding-bottom: ${rhythm(1.5)};
text-align: center;
border-bottom: none;
`

const Logo = styled(Link)`
`


const Header = ({ siteTitle }) => (
  <Container>
    <Logo to='/'>
      <Title>{ siteTitle }</Title>
    </Logo>
    <Menu>
      <MenuItem to="/docs">DOCS</MenuItem>
      <MenuItem to="/ast">AST</MenuItem>
      <MenuItem to="/syntax">SYNTAX</MenuItem>
      <MenuItem to="https://github.com/xiaoxinghu/orgajs">CODE</MenuItem>
    </Menu>
  </Container>
)

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: '',
}

export default Header
