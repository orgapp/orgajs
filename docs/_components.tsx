export function Notice({ title, children }: { children: React.ReactNode }) {
	return (
		<div className="rounded-md bg-yellow-50 p-2 border">
			<div className="ml-3">
				{title && (
					<h3 className="text-sm font-medium text-yellow-800">{title}</h3>
				)}
				<div className="mt-2 text-sm text-yellow-700">
					<p>{children}</p>
				</div>
			</div>
		</div>
	)
}
