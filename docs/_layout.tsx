import { ReactNode } from 'react'
import './style.css'

import type { SVGProps } from 'react'
const GitHub = (props: SVGProps<SVGSVGElement>) => (
	<svg
		width="1em"
		height="1em"
		viewBox="0 0 1024 1024"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		{...props}
	>
		<path
			fillRule="evenodd"
			clipRule="evenodd"
			d="M8 0C3.58 0 0 3.58 0 8C0 11.54 2.29 14.53 5.47 15.59C5.87 15.66 6.02 15.42 6.02 15.21C6.02 15.02 6.01 14.39 6.01 13.72C4 14.09 3.48 13.23 3.32 12.78C3.23 12.55 2.84 11.84 2.5 11.65C2.22 11.5 1.82 11.13 2.49 11.12C3.12 11.11 3.57 11.7 3.72 11.94C4.44 13.15 5.59 12.81 6.05 12.6C6.12 12.08 6.33 11.73 6.56 11.53C4.78 11.33 2.92 10.64 2.92 7.58C2.92 6.71 3.23 5.99 3.74 5.43C3.66 5.23 3.38 4.41 3.82 3.31C3.82 3.31 4.49 3.1 6.02 4.13C6.66 3.95 7.34 3.86 8.02 3.86C8.7 3.86 9.38 3.95 10.02 4.13C11.55 3.09 12.22 3.31 12.22 3.31C12.66 4.41 12.38 5.23 12.3 5.43C12.81 5.99 13.12 6.7 13.12 7.58C13.12 10.65 11.25 11.33 9.47 11.53C9.76 11.78 10.01 12.26 10.01 13.01C10.01 14.08 10 14.94 10 15.21C10 15.42 10.15 15.67 10.55 15.59C13.71 14.53 16 11.53 16 8C16 3.58 12.42 0 8 0Z"
			transform="scale(64)"
			fill="#1B1F23"
		/>
	</svg>
)

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
				<ol className="flex flex-1 gap-4">
					{navItems.map((item) => (
						<li key={item.name}>
							<a href={item.href} className="btn btn-ghost">
								{item.name}
							</a>
						</li>
					))}
				</ol>
				<div className="navbar-end">
					<a
						className="btn btn-ghost btn-circle"
						target="_blank"
						href="https://github.com/orgapp/orgajs"
					>
						<div className="indicator">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
							>
								<path stroke="none" d="M0 0h24v24H0z" fill="none" />
								<path d="M9 19c-4.3 1.4 -4.3 -2.5 -6 -3m12 5v-3.5c0 -1 .1 -1.4 -.5 -2c2.8 -.3 5.5 -1.4 5.5 -6a4.6 4.6 0 0 0 -1.3 -3.2a4.2 4.2 0 0 0 -.1 -3.2s-1.1 -.3 -3.5 1.3a12.3 12.3 0 0 0 -6.2 0c-2.4 -1.6 -3.5 -1.3 -3.5 -1.3a4.2 4.2 0 0 0 -.1 3.2a4.6 4.6 0 0 0 -1.3 3.2c0 4.6 2.7 5.7 5.5 6c-.6 .6 -.6 1.2 -.5 2v3.5" />
							</svg>
						</div>
					</a>
				</div>
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
