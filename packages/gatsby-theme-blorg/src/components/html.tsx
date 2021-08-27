/** @jsx jsx */
import { jsx, Box } from 'theme-ui'

export default function HTML({ raw }: { raw: string }) {
  return (
    <Box
      sx={{
        img: { maxWidth: '100%', borderRadius: 2, maxHeight: 500 },
      }}
    >
      <div dangerouslySetInnerHTML={{ __html: raw }} />
    </Box>
  )
}
