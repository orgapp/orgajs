import styled from 'styled-components'
import Link from './link'
import PropTypes from 'prop-types'
import React from 'react'
import typography from '../utils/typography'
import { Menu } from 'semantic-ui-react'
const { rhythm } = typography

const Container = styled.header`
padding-top: 3rem;
padding-bottom: 2rem;
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
      <Menu.Item as={Link} to='/docs'>
        DOCS
      </Menu.Item>
      <Menu.Item as={Link} to="/ast">AST</Menu.Item>
      <Menu.Item as={Link} to="/syntax">SYNTAX</Menu.Item>
      <Menu.Item as={Link} to="/roadmap">ROADMAP</Menu.Item>
      <Menu.Item
        position='right'
        as={Link}
        to="https://github.com/orgapp/orgajs">
        CODE
      </Menu.Item>
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
