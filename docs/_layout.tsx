import { isOrgContent } from '@orgajs/orgx'

interface LayoutProps {
	title: string
	children: React.ReactNode
}

export default function Layout({ title, children }: LayoutProps) {
	return (
		<html>
			<head>
				<title>{title}</title>
				<link
					rel="stylesheet"
					href="https://cdn.jsdelivr.net/npm/katex@0.16.21/dist/katex.min.css"
					integrity="sha384-zh0CIslj+VczCZtlzBcjt5ppRcsAmDnRem7ESsYwWwg3m/OaJ2l4x7YBZl9Kxxib"
					crossOrigin="anonymous"
				/>
				<link href="/style.css" rel="stylesheet" />
			</head>
			<body className="flex flex-col h-screen">
				<nav className="p-2 bg-base-100 border-b">
					<ol className="flex gap-4">
						<li>
							<a href="/">Orga</a>
						</li>
						<li>
							<a href="/guides">Guides</a>
						</li>
						<li>
							<a href="/advanced">advanced</a>
						</li>
						<li>
							<a href="/playground">Playground</a>
						</li>
					</ol>
				</nav>
				<main className="flex-grow flex-row overflow-hidden">
					{isOrgContent(children) ? <Content>{children}</Content> : children}
				</main>
				<footer className="flex justify-between p-2 bg-base-100 border-t">
					<div id="minibuffer" className=""></div>
					<p>© 2025 Orga</p>
				</footer>
				<script type="module" src="/layout.js" />
			</body>
		</html>
	)
}

export function DocumentLayout({ title, pages, children }) {
	return (
		<div className="flex h-full w-full">
			<aside className="w-64 bg-gray-50 p-4 border-r h-full overflow-y-auto">
				<ul>
					{pages
						.sort((a, b) => a.position - b.position)
						.map((page) => (
							<li key={page.slug}>
								<a
									className="block p-2 hover:bg-gray-300"
									href={`${page.slug}`}
								>
									{page.title}
								</a>
							</li>
						))}
				</ul>
			</aside>
			<Content>
				<h1>{title}</h1>
				{children}
			</Content>
		</div>
	)
}

function Content({ children }) {
	return (
		<div className="overflow-auto h-full w-full">
			<article className="prose p-4">{children}</article>
		</div>
	)
}
