/** @jsx jsx */
import { Link } from 'gatsby'
import { FaCalendar as DateIcon } from 'react-icons/fa'
import { Card, Flex, Heading, jsx, Text } from 'theme-ui'
import Tags from './tags'

interface Props {
  title: string
  slug: string
  category: string
  date: Date
  excerpt: string
  tags: string[]
}

const PostLink = ({ title, category, slug, date, excerpt, tags }: Props) => (
  <Card sx={{ mx: 'auto', width: '100%' }}>
    <article
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
      }}
    >
      <Link to={`/${category}`}>
        <Text sx={{ fontStyle: 'italic' }}>{category}</Text>
      </Link>
      <header>
        <Link to={slug}>
          <Heading as="h3">{title}</Heading>
        </Link>
        <time sx={{ color: 'gray', fontSize: 'small' }}>
          <DateIcon sx={{ mr: 1 }} />
          {date}
        </time>
      </header>
      <section sx={{ pb: 2, flex: 1 }}>
        <Text color="text">{excerpt}</Text>
      </section>
      <Flex sx={{ justifyContent: 'flex-end', px: 1 }}>
        <Tags tags={tags} />
      </Flex>
    </article>
  </Card>
)

export default PostLink
