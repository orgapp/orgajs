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
      p: 2,
      bg: 'muted',
      borderRadius: 6,
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
