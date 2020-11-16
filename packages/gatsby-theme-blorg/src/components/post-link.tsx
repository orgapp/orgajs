/** @jsx jsx */
import { Link } from 'gatsby'
import { Container, Flex, Heading, jsx, Text } from 'theme-ui'
import Tags from './tags'

interface Props {
  title: string;
  slug: string;
  category: string;
  date: Date;
  excerpt: string;
  tags: string[];
}

const PostLink = ({ title, category, slug, date, excerpt, tags }: Props) => (
  <Container variant='content'>
    <article sx={{
      display: 'flex',
      flexDirection: 'column',
      p: 3,
      bg: 'muted',
      borderRadius: '1em',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.1)',
      borderStyle: 'solid',
      boxShadow: '0 4px 8px 0 rgba(0,0,0,0.2)',
      transition: '0.3s',
      '&:hover': {
        boxShadow: '0 8px 16px 0 rgba(0,0,0,0.2)',
      },
      height: '100%',
    }}>
      <Link to={`/${category}`}>
        <Text sx={{ fontStyle: 'italic' }}>{category}</Text>
      </Link>
      <header>
        <Link to={slug}>
          <Heading as='h1'>{title}</Heading>
        </Link>
        <small sx={{ color: 'gray' }}>{date}</small>
      </header>
      <section sx={{ pb: 2, flex: 1 }}>
        <Text color='text'>{excerpt}</Text>
      </section>
      <Flex sx={{ justifyContent: 'flex-end', px: 1 }}>
        <Tags tags={tags} />
      </Flex>
    </article>
  </Container>
)

export default PostLink
