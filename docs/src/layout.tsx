interface AppProps {
	title: string
	children: React.ReactNode
}

export default function App({ title, children }) {
	return (
		<html>
			<head>
				<title>{title}</title>
				<link href="/style.css" rel="stylesheet" />
			</head>
			<body className="min-h-screen flex flex-col">
				<header className="p-2 bg-gray-200"></header>
				<main className="flex-1 prose">{children}</main>
				<footer className="p-4 bg-gray-200">
					<p>© 2021 Orga</p>
				</footer>
			</body>
		</html>
	)
}
