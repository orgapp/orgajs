import styled from 'styled-components'
import { Link } from 'gatsby'
import PropTypes from 'prop-types'
import React from 'react'

const Container = styled.header`
padding-top: 3rem;
padding-bottom: 2rem;
display: flex;
align-items: center;
@media print {
  display: none !important;
}
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
`

const Header = ({ siteTitle }) => (
  <Container>
    <h1>{ siteTitle }</h1>
    <Menu>
      <MenuItem to="/">HOME</MenuItem>
      <MenuItem to="/docs">DOCS</MenuItem>
      <MenuItem to="/github">GITHUB</MenuItem>
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
