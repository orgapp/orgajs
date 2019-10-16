import { useStaticQuery, graphql } from 'gatsby'
import styled from 'styled-components'
import Link from './link'
import PropTypes from 'prop-types'
import React from 'react'
import typography from '../utils/typography'
import { Menu } from 'semantic-ui-react'
import Img from 'gatsby-image'
const { rhythm } = typography

const Container = styled.header`
padding-top: 3rem;
padding-bottom: 2rem;
`

const LOGO_SIZE = 250

const Title = styled.h1`
color: gray;
margin: 0 auto;
padding-bottom: ${rhythm(1.5)};
text-align: center;
border-bottom: none;
`

const Logo = styled(Img)`
width: ${LOGO_SIZE}px;
margin: 0 1em 0 0;
border-radius: 3em;
transition: box-shadow 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
`

const Banner = styled(Link)`
display: flex;
flex-direction: column;
align-items: center;
`


const Header = ({ siteTitle }) => {

  const data = useStaticQuery(graphql`
query headerQuery {
  logo: file(relativePath: { eq: "logo.png" }) {
    childImageSharp {
      fluid(maxWidth: 250, maxHeight: 250) {
        ...GatsbyImageSharpFluid
      }
    }
  }
}
`)

  return (
    <Container>
      <Banner to='/'>
        <Logo fluid={data.logo.childImageSharp.fluid}/>
        <Title>{ siteTitle }</Title>
      </Banner>
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
}

Header.propTypes = {
  siteTitle: PropTypes.string,
}

Header.defaultProps = {
  siteTitle: '',
}

export default Header
