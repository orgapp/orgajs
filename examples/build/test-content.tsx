import { getPages, getPage } from 'orga-build:content'

export default function TestContent() {
  // Test 1: Get all pages
  const allPages = getPages()

  // Test 2: Get a specific page
  const indexPage = getPage('index')

  // Test 3: Filter pages
  const filtered = getPages('', (entry) => entry.ext === 'org')

  return (
    <div>
      <h1>Content API Test</h1>

      <h2>All Pages ({allPages.length})</h2>
      <ul>
        {allPages.map((page) => (
          <li key={page.id}>
            <strong>{page.id}</strong> - {page.slug} (path: {page.path || '(root)'})
            {page.data && Object.keys(page.data).length > 0 && (
              <pre>{JSON.stringify(page.data, null, 2)}</pre>
            )}
          </li>
        ))}
      </ul>

      <h2>Index Page</h2>
      {indexPage ? (
        <div>
          <p>Found: {indexPage.slug}</p>
          <pre>{JSON.stringify(indexPage, null, 2)}</pre>
        </div>
      ) : (
        <p>Not found</p>
      )}

      <h2>Filtered Pages (org only)</h2>
      <ul>
        {filtered.map((page) => (
          <li key={page.id}>{page.slug} - {page.ext}</li>
        ))}
      </ul>
    </div>
  )
}
