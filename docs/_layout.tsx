import { isOrgContent } from '@orgajs/orgx'
interface LayoutProps {
	title: string
	children: React.ReactNode
}

export default function Layout({ title, pages, children }: LayoutProps) {
	return (
		<html>
			<head>
				<title>{title}</title>
				<link href="/style.css" rel="stylesheet" />
			</head>
			<body className="min-h-screen flex flex-col">
				<nav className="p-2 bg-gray-100 border-b">
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
				<main className="flex-1">
					{isOrgContent(children) ? <Content>{children}</Content> : children}
				</main>
				<footer className="p-4 bg-gray-200">
					<p>© 2021 Orga</p>
				</footer>
				<script src="/main.js" />
			</body>
		</html>
	)
}

export function DocumentLayout({ title, pages, children }) {
	return (
		<div className="flex h-full">
			<aside className="w-64 bg-gray-50 p-4 border-r">
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
	return <article className="prose p-4">{children}</article>
}
