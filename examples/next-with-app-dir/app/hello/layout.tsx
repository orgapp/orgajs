export const metadata = {
  title: 'org-mode file',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <article
      style={{
        maxWidth: 700,
        margin: '0 auto',
        backgroundColor: '#f5f5f5',
        padding: '1rem',
      }}
    >
      {children}
    </article>
  )
}
