import styled from 'styled-components'
import { Link } from 'gatsby'
import PropTypes from 'prop-types'
import React from 'react'

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
padding-bottom: 1rem;
text-align: center;
border-bottom: none;
`

const Header = ({ siteTitle }) => (
  <Container>
    <Title>{ siteTitle }</Title>
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
