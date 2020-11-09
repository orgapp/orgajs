/** @jsx jsx */
import Tags from './tags'
import { Styled, Flex, Heading, Text, Badge, jsx } from "theme-ui"
import { Link } from "gatsby"

interface Props {
  title: string;
  fields: { slug: string };
  date: Date;
  excerpt: string;
  tags: string[];
}

const PostLink = ({ title, fields: { slug }, date, excerpt, tags }: Props) => (
  <article sx={{
    p: 2, my: 2,
    bg: 'muted',
    borderRadius: 6,
    transition: '0.3s',
    '&:hover': { bg: 'highlight' },
  }}>
    <Link href={slug}>
      <header>
        <small sx={{ color: 'gray' }}>{date}</small>
        <Heading as='h1'>{ title }</Heading>
      </header>
      <section>
        <Text color='text'>{excerpt}</Text>
      </section>
    </Link>
    <Flex sx={{ justifyContent: 'flex-end', px: 2 }}>
      <Tags tags={tags}/>
    </Flex>
  </article>
)

export default PostLink
