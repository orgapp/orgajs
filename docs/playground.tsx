export const title = 'Orga Playground'

const content = `* Hey, there

The /beauty/ of org *must* be shared.
[[https://upload.wikimedia.org/wikipedia/commons/a/a6/Org-mode-unicorn.svg][org-mode logo]]
`

export default function Playground() {
	return (
		<div>
			<orga-playground content={content} />
		</div>
	)
}
