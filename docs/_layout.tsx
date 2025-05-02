import { ReactNode } from 'react'
import './style.css'

interface LayoutProps {
	title: string
	children: ReactNode
}

const navItems = [
	{ name: 'Orga', href: '/' },
	{ name: 'Documents', href: '/guides' },
	{ name: 'Playground', href: '/playground' }
]

export default function Layout({ children }: LayoutProps) {
	return (
		<>
			<nav className="navbar bg-base-200 shadow-sm">
				<ol className="flex gap-4">
					{navItems.map((item) => (
						<li key={item.name}>
							<a href={item.href} className="btn btn-ghost">
								{item.name}
							</a>
						</li>
					))}
				</ol>
			</nav>
			<main className="flex-grow flex-row overflow-hidden">{children}</main>
			<footer className="footer sm:footer-horizontal footer-center bg-base-200 text-base-content p-4">
				<aside>
					<p>Copyright © {new Date().getFullYear()} - All right reserved</p>
				</aside>
			</footer>
			{/* Client-side JS is now added by build process */}
		</>
	)
}

type Page = {
	slug: string
	title: string
	position: number
	type: string
}

function findParentSlug(slug: string, pages: Page[]): string | null {
	const parts = slug.split('/').filter(Boolean)
	while (parts.length > 0) {
		parts.pop()
		const parentSlug = '/' + parts.join('/')
		if (pages.some((p) => p.slug === parentSlug)) return parentSlug
	}
	return null
}

function renderMenu(path: string, pages: Page[]) {
	const children = pages
		.filter(
			(p) => findParentSlug(p.slug, pages) === path && p.type === 'document'
		)
		.sort((a, b) => (Number(a.position) || 0) - (Number(b.position) || 0))

	if (children.length === 0) return null

	return (
		<ul>
			{children.map((child) => (
				<li key={child.slug}>
					<a href={child.slug}>{child.title}</a>
					{renderMenu(child.slug, pages)}
				</li>
			))}
		</ul>
	)
}

export function DocumentLayout({ title, pages = [], children }) {
	return (
		<div className="flex h-full w-full">
			<ul className="menu bg-base-300 w-56">{renderMenu('/', pages)}</ul>
			<Content>
				<h1>{title}</h1>
				{children}
			</Content>
		</div>
	)
}

function Content({ children }: { children: ReactNode }) {
	return (
		<div className="overflow-auto h-full w-full">
			<article className="prose p-4">{children}</article>
		</div>
	)
}
